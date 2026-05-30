import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { SURAHS, RECITERS, TAFSIR_AUDIO } from "@/data/quran"
import { EmptyState } from "@/components/shared"
import { easings } from "@/lib/easings"
import QuranSurahView from "./QuranSurahView"
import type { Reciter, Surah } from "@/data/quran"

type QuranTab = "surahs" | "reciters" | "bookmarks"

const REVELATION_FILTERS = [
  { key: null as string | null, label: "All" },
  { key: "Meccan", label: "Meccan" },
  { key: "Medinan", label: "Medinan" },
]

function getBookmarks(): number[] {
  try { return JSON.parse(localStorage.getItem("quran_bookmarks") || "[]") } catch { return [] }
}
function setBookmarks(ids: number[]) { localStorage.setItem("quran_bookmarks", JSON.stringify(ids)) }
function getContinue(): { surah: number; reciter: string; timestamp: number } | null {
  try { return JSON.parse(localStorage.getItem("quran_continue") || "null") } catch { return null }
}
function setContinue(val: { surah: number; reciter: string; timestamp: number }) {
  localStorage.setItem("quran_continue", JSON.stringify(val))
}

function SurahCard({ surah, isBookmarked, onPlay, onToggleBookmark, index }: {
  surah: Surah; isBookmarked: boolean; onPlay: () => void; onToggleBookmark: () => void; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.3, ease: easings }}
      whileHover={{ y: -3 }}
      className="group relative p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all cursor-pointer overflow-hidden"
      onClick={onPlay}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
          {surah.number.toString().padStart(2, "0")}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark() }}
          className={cn(
            "text-sm transition-colors p-1",
            isBookmarked ? "text-white" : "text-white/20 opacity-0 group-hover:opacity-100"
          )}
        >
          <i className={`fa-solid ${isBookmarked ? "fa-bookmark" : "fa-bookmark"}`} />
        </button>
      </div>
      <p className="text-lg font-arabic text-right mb-1 opacity-80" dir="rtl">{surah.arabicName}</p>
      <p className="font-semibold text-sm truncate">{surah.name}</p>
      <div className="flex items-center gap-2 mt-1.5 text-xs text-white/40">
        <span>{surah.verses} verses</span>
        <span>·</span>
        <span className={surah.revelation === "Meccan" ? "text-blue-400/60" : "text-amber-400/60"}>{surah.revelation}</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  )
}

function ReciterCard({ reciter, index, onSelect }: { reciter: Reciter; index: number; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025, duration: 0.3, ease: easings }}
      whileHover={{ y: -3 }}
      onClick={onSelect}
      className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all cursor-pointer text-center"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-lg border border-white/5">
        <i className="fa-solid fa-microphone text-2xl text-white/50" />
      </div>
      <p className="font-semibold text-sm truncate">{reciter.name}</p>
      <p className="text-xs text-white/40 mt-0.5" dir="rtl">{reciter.arabicName}</p>
      <p className="text-[10px] text-white/30 mt-1.5">{reciter.style} · {reciter.riwayah}</p>
    </motion.div>
  )
}

type SurahView = { type: "surah"; surah: Surah } | { type: "reciter"; reciter: Reciter }

export default function QuranPage() {
  const [activeTab, setActiveTab] = useState<QuranTab>("surahs")
  const [search, setSearch] = useState("")
  const [revelationFilter, setRevelationFilter] = useState<string | null>(null)
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].id)
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null)
  const [detail, setDetail] = useState<SurahView | null>(null)
  const [bookmarkIds, setBookmarkIds] = useState<number[]>(getBookmarks)
  const [continueData, setContinueData] = useState(getContinue)

  useEffect(() => { setBookmarks(bookmarkIds) }, [bookmarkIds])
  useEffect(() => { if (continueData) setContinue(continueData) }, [continueData])

  const handlePlay = useCallback((surah: Surah, reciter?: string) => {
    const r = reciter || selectedReciter
    setContinueData({ surah: surah.number, reciter: r, timestamp: Date.now() })
    setSelectedSurah(surah.number)
  }, [selectedReciter])

  const toggleBookmark = useCallback((number: number) => {
    setBookmarkIds((prev) =>
      prev.includes(number) ? prev.filter((id) => id !== number) : [...prev, number]
    )
  }, [])

  const filteredSurahs = useMemo(() => {
    let s = SURAHS
    if (search.trim()) {
      const q = search.toLowerCase()
      s = s.filter(
        (surah) =>
          surah.name.toLowerCase().includes(q) ||
          surah.arabicName.includes(search) ||
          surah.englishName.toLowerCase().includes(q)
      )
    }
    if (revelationFilter) s = s.filter((surah) => surah.revelation === revelationFilter)
    return s
  }, [search, revelationFilter])

  const bookmarkedSurahs = useMemo(
    () => SURAHS.filter((s) => bookmarkIds.includes(s.number)),
    [bookmarkIds]
  )

  const continueSurah = useMemo(
    () => (continueData ? SURAHS.find((s) => s.number === continueData.surah) : null),
    [continueData]
  )

  if (selectedSurah) {
    return (
      <div className="pb-8">
        <QuranSurahView
          surahNumber={selectedSurah}
          reciterId={selectedReciter}
          onClose={() => setSelectedSurah(null)}
        />
      </div>
    )
  }

  return (
    <div className="pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easings }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <i className="fa-solid fa-quran text-white text-sm" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Al-Quran</h1>
        </div>
        <p className="text-white/40 text-sm ml-11">Listen, reflect, and connect with the divine words</p>
      </motion.div>

      {/* Continue listening banner */}
      <AnimatePresence>
        {continueSurah && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-gradient-to-r from-white/10 via-white/5 to-transparent border border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-play text-white text-sm ml-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40">Continue Listening</p>
                  <p className="text-sm font-semibold truncate">{continueSurah.name} ({continueSurah.arabicName})</p>
                </div>
                <button
                  onClick={() => handlePlay(continueSurah)}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shrink-0"
                >
                  Resume
                </button>
                <button
                  onClick={() => { setContinueData(null); localStorage.removeItem("quran_continue") }}
                  className="text-white/30 hover:text-white/60 p-1 shrink-0"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl bg-white/[0.03] p-1 border border-white/[0.06] w-fit mb-6">
        {[
          { key: "surahs" as QuranTab, label: "Surahs", icon: "fa-list" },
          { key: "reciters" as QuranTab, label: "Reciters", icon: "fa-microphone" },
          { key: "bookmarks" as QuranTab, label: "Bookmarks", icon: "fa-bookmark" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              activeTab === tab.key ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white/70"
            )}
          >
            <i className={`fa-solid ${tab.icon} text-xs`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Surahs View */}
      {activeTab === "surahs" && (
        <motion.div
          key="surahs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search surahs..."
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div className="flex gap-1.5">
              {REVELATION_FILTERS.map((f) => (
                <button
                  key={f.key || "all"}
                  onClick={() => setRevelationFilter(f.key)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold transition-all border",
                    revelationFilter === f.key
                      ? "bg-emerald-500/15 border-emerald-500/30 text-white"
                      : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reciter selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            <span className="text-xs text-white/30 font-medium shrink-0">Reciter:</span>
            {RECITERS.slice(0, 6).map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReciter(r.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border shrink-0",
                  selectedReciter === r.id
                    ? "bg-emerald-500/15 border-emerald-500/30 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                )}
              >
                {r.name.split(" ").slice(0, 2).join(" ")}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredSurahs.length > 0 ? (
              filteredSurahs.map((surah, i) => (
                <SurahCard
                  key={surah.number}
                  surah={surah}
                  index={i}
                  isBookmarked={bookmarkIds.includes(surah.number)}
                  onPlay={() => handlePlay(surah)}
                  onToggleBookmark={() => toggleBookmark(surah.number)}
                />
              ))
            ) : (
<div className="col-span-full">
  <EmptyState icon="fa-quran" title="No surahs found" />
</div>
            )}
          </div>

          {/* Juz quick nav */}
          <div className="pt-6">
            <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-3">Jump to Juz</p>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                const surahsInJuz = SURAHS.filter((s) => s.juz.includes(j))
                const firstSurah = surahsInJuz[0]
                return (
                  <button
                    key={j}
                    onClick={() => {
                      setSearch(`Juz ${j}`)
                    }}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all shrink-0 min-w-[56px]"
                  >
                    <span className="text-xs font-bold text-white/70">{j}</span>
                    <span className="text-[9px] text-white/30">Juz</span>
                    {firstSurah && <span className="text-[8px] text-white/20 truncate max-w-[48px]">{firstSurah.name}</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tafsir audio section */}
          <section className="pt-4">
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-3">
              <i className="fa-solid fa-book-open mr-2" />
              Tafsir Audio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {TAFSIR_AUDIO.map((tafsir, i) => {
                const surah = SURAHS.find((s) => s.number === tafsir.surah)
                return (
                  <motion.div
                    key={tafsir.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: easings }}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <i className="fa-solid fa-headphones text-amber-400/60 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tafsir.title}</p>
                      <p className="text-xs text-white/40 truncate">{tafsir.speaker} · {Math.floor(tafsir.duration / 60)} min</p>
                      {surah && <p className="text-[10px] text-white/20 truncate">{surah.arabicName}</p>}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all shrink-0">
                      <i className="fa-solid fa-play text-xs ml-0.5" />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </section>
        </motion.div>
      )}

      {/* Reciters View */}
      {activeTab === "reciters" && (
        <motion.div
          key="reciters"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {RECITERS.map((reciter, i) => (
              <ReciterCard key={reciter.id} reciter={reciter} index={i} onSelect={() => {
                setSelectedReciter(reciter.id)
                setActiveTab("surahs")
              }} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Bookmarks View */}
      {activeTab === "bookmarks" && (
        <motion.div
          key="bookmarks"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {bookmarkedSurahs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {bookmarkedSurahs.map((surah, i) => (
                <SurahCard
                  key={surah.number}
                  surah={surah}
                  index={i}
                  isBookmarked
                  onPlay={() => handlePlay(surah)}
                  onToggleBookmark={() => toggleBookmark(surah.number)}
                />
              ))}
            </div>
          ) : (
<EmptyState icon="fa-bookmark" title="No bookmarks yet" desc="Bookmark surahs to quickly access your favorites" />
          )}
        </motion.div>
      )}
    </div>
  )
}
