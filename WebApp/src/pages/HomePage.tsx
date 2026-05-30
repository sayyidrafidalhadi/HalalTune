import { useRef, useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useLibraryStore } from "@/store/libraryStore"
import { usePlayerStore } from "@/store/playerStore"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/shared"
import { easings } from "@/lib/easings"
import { SURAHS, RECITERS } from "@/data/quran"
import { fetchAndSetTracks } from "@/services/supabaseService"
import { fetchSurahDetail } from "@/services/quranApi"
import type { Track } from "@/types"

const MOODS = [
  { label: "Peaceful", icon: "fa-spa", gradient: "from-white to-teal-700" },
  { label: "Focus", icon: "fa-brain", gradient: "from-blue-600 to-indigo-800" },
  { label: "Spiritual", icon: "fa-moon", gradient: "from-purple-600 to-violet-900" },
  { label: "Energetic", icon: "fa-bolt", gradient: "from-amber-500 to-orange-700" },
  { label: "Sleep", icon: "fa-cloud-moon", gradient: "from-slate-700 to-zinc-900" },
  { label: "Reflect", icon: "fa-feather-pointed", gradient: "from-rose-600 to-pink-800" },
]

const QURAN_PICKS = [
  { surahNumber: 36, name: "Surah Yaseen", reciter: "Mishary Rashid", verses: 83, gradient: "from-white/60 to-black" },
  { surahNumber: 55, name: "Surah Ar-Rahman", reciter: "Abdul Rahman Al-Sudais", verses: 78, gradient: "from-blue-900/60 to-black" },
  { surahNumber: 18, name: "Surah Al-Kahf", reciter: "Saad Al-Ghamidi", verses: 110, gradient: "from-purple-900/60 to-black" },
  { surahNumber: 19, name: "Surah Maryam", reciter: "Yasser Al-Dosari", verses: 98, gradient: "from-amber-900/60 to-black" },
  { surahNumber: 56, name: "Surah Al-Waqi'ah", reciter: "Maher Al-Muaiqly", verses: 96, gradient: "from-rose-900/60 to-black" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.35, ease: easings },
  }),
}

function TrackCard({
  track,
  index,
  isActive,
  isPlaying,
  onPlay,
  dense,
}: {
  track: Track
  index: number
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
  dense?: boolean
}) {
  return (
    <motion.button
      variants={cardVariants}
      custom={index}
      onClick={onPlay}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "group relative flex-shrink-0 text-left outline-none focus:outline-none focus-visible:ring-0 rounded-2xl",
        dense ? "w-[140px]" : "w-[170px]",
        isActive && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-black"
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl mb-3",
          "shadow-lg shadow-black/40",
          dense ? "aspect-square" : "aspect-square"
        )}
      >
        {track.coverArt ? (
          <img
            src={track.coverArt}
            alt=""
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/40 via-black to-black flex items-center justify-center">
            <i className="fa-solid fa-music text-4xl text-white/15" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />

        {dense && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold text-white/60 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
              {track.language || "Mix"}
            </span>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-xl",
              "backdrop-blur-xl transition-transform duration-200 group-hover:scale-105",
              isActive && isPlaying
                ? "bg-emerald-400 text-black"
                : "bg-white/90 text-black opacity-0 group-hover:opacity-100"
            )}
          >
            <i
              className={cn(
                "fa-solid text-lg",
                isActive && isPlaying ? "fa-pause" : "fa-play ml-0.5"
              )}
            />
          </div>
        </motion.div>
      </div>

      <p
        className={cn(
          "font-semibold truncate leading-tight",
          dense ? "text-sm" : "text-sm",
          isActive ? "text-white" : "text-white"
        )}
      >
        {track.title}
      </p>
      <p className={cn("text-white/40 truncate", dense ? "text-xs" : "text-xs")}>
        {track.artist}
      </p>
    </motion.button>
  )
}

function Carousel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div className="relative">
      <div
        ref={ref}
        className={cn(
          "flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 md:-mx-8 px-4 md:px-8 snap-x snap-mandatory",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  onSeeAll,
}: {
  title: string
  subtitle?: string
  onSeeAll?: () => void
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-white/40 mt-0.5 font-medium">{subtitle}</p>
        )}
      </div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-white/40 hover:text-white transition-colors uppercase tracking-wider"
        >
          See all
        </button>
      )}
    </div>
  )
}

const timeOfDay = () => {
  const h = new Date().getHours()
  if (h < 12) return "Morning"
  if (h < 17) return "Afternoon"
  if (h < 21) return "Evening"
  return "Night"
}

const heroGradient = () => {
  const h = new Date().getHours()
  if (h < 6) return "from-indigo-950 via-black to-black"
  if (h < 12) return "from-white via-black to-black"
  if (h < 17) return "from-amber-950 via-black to-black"
  if (h < 21) return "from-orange-950 via-black to-black"
  return "from-slate-950 via-black to-black"
}

export default function HomePage() {
  const { tracks, speedDialPicks, setTracks } = useLibraryStore()
  const { setQueue, setQuranAyahs, isPlaying, togglePlay, currentTrack } = usePlayerStore()
  const { historyList } = useAuthStore()
  const { setFsPlayerOpen } = useUIStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (tracks.length === 0) {
      fetchAndSetTracks()
    }
  }, [tracks.length])

  const nowPlaying = currentTrack()

  const recents = useMemo(
    () =>
      historyList
        .map((h) => tracks.find((t) => t.id === h.id))
        .filter(Boolean)
        .slice(0, 10) as typeof tracks,
    [historyList, tracks]
  )

  const trending = useMemo(
    () => [...tracks].sort((a, b) => (b.streamCount || 0) - (a.streamCount || 0)).slice(0, 14),
    [tracks]
  )

  const recentlyAdded = useMemo(
    () => [...tracks].reverse().slice(0, 12),
    [tracks]
  )

  const madeForYou = useMemo(() => {
    if (tracks.length === 0) return []
    const shuffled = [...tracks].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  }, [tracks])

  const handlePlay = (track: (typeof tracks)[0]) => {
    const idx = tracks.indexOf(track)
    if (idx === -1) return
    setQueue(tracks, idx)
  }

  const handleQuranPlay = useCallback(async (surahNumber: number, reciterName: string) => {
    const surah = SURAHS.find((s) => s.number === surahNumber)
    if (!surah) return
    const reciter = RECITERS.find((r) => reciterName.includes(r.name.split(" ")[0]))
    if (!reciter) return

    const detail = await fetchSurahDetail(surah.number, reciter.id)
    if (!detail) return

    const surahTitle = `${detail.englishName} (${detail.arabicName})`
    const tracks: Track[] = detail.ayahs.map((ayah) => ({
      id: `quran-${surah.number}-${ayah.numberInSurah}`,
      title: `Ayah ${ayah.numberInSurah}`,
      artist: surahTitle,
      url: ayah.audioUrl,
      isQuran: true,
      surahNumber: surah.number,
      ayahNumber: ayah.numberInSurah,
      arabicText: ayah.text,
      translationText: ayah.translation,
      surahName: surahTitle,
      duration: 30,
    }))

    setQuranAyahs(detail.ayahs.map((a) => ({
      numberInSurah: a.numberInSurah,
      text: a.text,
      translation: a.translation,
      audioUrl: a.audioUrl,
    })))
    setQueue(tracks, 0)
    setFsPlayerOpen(true)
  }, [setQueue, setQuranAyahs, setFsPlayerOpen])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-10 -mt-4 md:-mt-6"
    >
      {/* ───── Cinematic Hero ───── */}
      <motion.section variants={sectionVariants} className="relative -mx-4 md:-mx-8 mb-10 overflow-hidden">
        <div
          className={cn(
            "relative min-h-[340px] md:min-h-[420px] flex items-end px-4 md:px-8 pb-8 md:pb-10",
            "bg-gradient-to-b",
            heroGradient()
          )}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-400/5 rounded-full blur-[100px]" />
            <div className="absolute top-10 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-3"
            >
              {timeOfDay()} Listening
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-4"
            >
              Discover
              <br />
              <span className="bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent">
                Halal Audio
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-white/50 text-base md:text-lg max-w-lg leading-relaxed mb-6"
            >
              Curated nasheeds, Quran recitations, and Islamic podcasts — all halal, all beautiful.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <button className="h-11 md:h-12 px-7 md:px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm md:text-base transition-all active:scale-95 shadow-lg shadow-emerald-500/25">
                <i className="fa-solid fa-play mr-2" />
                Start Listening
              </button>
              <button className="h-11 md:h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white/80 hover:text-white text-sm font-semibold transition-all border border-white/10 active:scale-95">
                <i className="fa-solid fa-shuffle mr-2" />
                Shuffle
              </button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ───── Continue Listening ───── */}
      {recents.length > 0 && (
        <motion.section variants={sectionVariants} className="mb-10">
          <SectionHeader title="Continue Listening" subtitle="Pick up where you left off" onSeeAll={() => setHistoryOpen(true)} />
          <Carousel>
            {recents.map((track, i) => {
              const active = nowPlaying?.id === track.id
              return (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={i}
                  isActive={active}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlay(track)}
                />
              )
            })}
          </Carousel>
        </motion.section>
      )}

      {/* ───── Speed Dial / Quick Picks ───── */}
      {speedDialPicks.length > 0 && (
        <motion.section variants={sectionVariants} className="mb-10">
          <SectionHeader title="Your Quick Picks" subtitle="Jump back in" />
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
            {speedDialPicks.map((track, i) => {
              const active = nowPlaying?.id === track.id
              return (
                <motion.button
                  key={track.id}
                  variants={cardVariants}
                  custom={i}
                  onClick={() => handlePlay(track)}
                  whileTap={{ scale: 0.94 }}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden group cursor-pointer",
                    "shadow-lg shadow-black/30 ring-1 ring-white/5",
                    active && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-black"
                  )}
                >
                  {track.coverArt ? (
                    <img
                      src={track.coverArt}
                      alt=""
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-white/30 via-black to-black flex items-center justify-center">
                      <i className="fa-solid fa-music text-3xl text-white/15" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      "bg-black/0 group-hover:bg-black/30 transition-all duration-300"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100">
                      <i
                        className={cn(
                          "fa-solid text-sm",
                          active && isPlaying ? "fa-pause" : "fa-play ml-0.5"
                        )}
                      />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-bold truncate drop-shadow-lg text-white">
                      {track.title}
                    </p>
                    <p className="text-[10px] text-white/50 truncate">{track.artist}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* ───── Mood Categories ───── */}
      <motion.section variants={sectionVariants} className="mb-10">
        <SectionHeader title="Browse by Mood" subtitle="Find what fits your feeling" />
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 snap-x snap-mandatory -mx-4 md:-mx-8 px-4 md:px-8">
          {MOODS.map((mood, i) => (
            <motion.button
              key={mood.label}
              variants={cardVariants}
              custom={i}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 snap-start"
            >
              <div
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5 rounded-2xl",
                  "bg-gradient-to-br shadow-lg",
                  mood.gradient
                )}
              >
                <i className={`fa-solid ${mood.icon} text-white/80 text-lg`} />
                <span className="text-sm font-bold text-white whitespace-nowrap">
                  {mood.label}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ───── Trending Halal Tracks ───── */}
      {trending.length > 0 && (
        <motion.section variants={sectionVariants} className="mb-10">
          <SectionHeader title="Trending Now" subtitle="Most played this week" />
          <Carousel>
            {trending.map((track, i) => {
              const active = nowPlaying?.id === track.id
              return (
                <div key={track.id} className="flex-shrink-0 w-[170px] snap-start">
                  <TrackCard
                    track={track}
                    index={i}
                    isActive={active}
                    isPlaying={isPlaying}
                    onPlay={() => handlePlay(track)}
                  />
                  <div className="flex items-center gap-1.5 mt-1 px-0.5">
                    <i className="fa-solid fa-fire text-[10px] text-white/60" />
                    <span className="text-[10px] text-white/30 font-medium">
                      {track.streamCount || 0} plays
                    </span>
                  </div>
                </div>
              )
            })}
          </Carousel>
        </motion.section>
      )}

      {/* ───── Quran Picks ───── */}
      <motion.section variants={sectionVariants} className="mb-10">
        <SectionHeader title="Quran Recitations" subtitle="Featured selections" />
        <Carousel>
          {QURAN_PICKS.map((item, i) => (
            <motion.button
              key={item.name}
              variants={cardVariants}
              custom={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuranPlay(item.surahNumber, item.reciter)}
              className="flex-shrink-0 w-[220px] snap-start text-left group"
            >
              <div
                className={cn(
                  "relative h-40 rounded-2xl overflow-hidden p-5 shadow-lg",
                  "bg-gradient-to-br ring-1 ring-white/5",
                  item.gradient
                )}
              >
                <div className="absolute top-3 right-4 text-6xl font-extrabold text-white/5 select-none leading-none">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <i className="fa-solid fa-book-quran text-white text-sm" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm mb-0.5">{item.name}</p>
                    <p className="text-xs text-white/50">{item.reciter}</p>
                    <p className="text-[10px] text-white/30 mt-1">{item.verses} verses</p>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
              </div>
            </motion.button>
          ))}
        </Carousel>
      </motion.section>

      {/* ───── Recently Added ───── */}
      {recentlyAdded.length > 0 && (
        <motion.section variants={sectionVariants} className="mb-10">
          <SectionHeader title="Recently Added" subtitle="Fresh in the library" />
          <Carousel>
            {recentlyAdded.map((track, i) => {
              const active = nowPlaying?.id === track.id
              return (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={i}
                  isActive={active}
                  isPlaying={isPlaying}
                  onPlay={() => handlePlay(track)}
                  dense
                />
              )
            })}
          </Carousel>
        </motion.section>
      )}

      {/* ───── Made for You ───── */}
      {madeForYou.length > 0 && (
        <motion.section variants={sectionVariants} className="mb-10">
          <SectionHeader title="Made for You" subtitle="Personalized recommendations" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {madeForYou.map((track, i) => {
              const active = nowPlaying?.id === track.id
              return (
                <motion.button
                  key={track.id}
                  variants={cardVariants}
                  custom={i}
                  onClick={() => handlePlay(track)}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl text-left",
                    "shadow-lg shadow-black/30 ring-1 ring-white/5",
                    active && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-black"
                  )}
                >
                  <div className={cn("aspect-square overflow-hidden")}>
                    {track.coverArt ? (
                      <img
                        src={track.coverArt}
                        alt=""
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/30 via-black to-black flex items-center justify-center">
                        <i className="fa-solid fa-music text-3xl text-white/15" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100">
                        <i
                          className={cn(
                            "fa-solid text-sm",
                            active && isPlaying ? "fa-pause" : "fa-play ml-0.5"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-black/80">
                    <p
                      className={cn(
                        "text-xs font-semibold truncate",
                        active ? "text-white" : "text-white"
                      )}
                    >
                      {track.title}
                    </p>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{track.artist}</p>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* ───── Empty State ───── */}
      {tracks.length === 0 && (
            <motion.div variants={sectionVariants}>
              <EmptyState icon="fa-headphones" title="Your library is empty" desc="Tracks will appear here once they're loaded from the server." />
            </motion.div>
      )}
    </motion.div>
  )
}
