import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { usePlayerStore } from "@/store/playerStore"
import { cn, formatTime } from "@/lib/utils"
import { Spinner } from "@/components/shared"
import { fetchSurahDetail } from "@/services/quranApi"
import type { Track, QuranAyah } from "@/types"

export default function QuranFullScreenContent() {
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const quranAyahs = usePlayerStore((s) => s.quranAyahs)
  const setQuranAyahs = usePlayerStore((s) => s.setQuranAyahs)
  const currentQueue = usePlayerStore((s) => s.currentQueue)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const currentTrackIndex = usePlayerStore((s) => s.currentTrackIndex)
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying)
  const setCurrentTrackIndex = usePlayerStore((s) => s.setCurrentTrackIndex)
  const playNext = usePlayerStore((s) => s.playNext)
  const playPrev = usePlayerStore((s) => s.playPrev)
  const currentTime = usePlayerStore((s) => s.currentTime)
  const duration = usePlayerStore((s) => s.duration)
  const progress = usePlayerStore((s) => s.progress)

  const track = currentTrack()
  const [loading, setLoading] = useState(!quranAyahs.length)
  const [audioError, setAudioError] = useState(false)
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const surahNumber = track?.surahNumber

  // Fetch surah detail if needed
  useEffect(() => {
    if (!surahNumber || quranAyahs.length > 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchSurahDetail(surahNumber, "mishary")
      .then((data) => {
        const mapped: QuranAyah[] = data.ayahs.map((a) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
          translation: a.translation,
          audioUrl: a.audioUrl,
        }))
        setQuranAyahs(mapped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [surahNumber, quranAyahs.length, setQuranAyahs])

  const currentAyahNumber = track?.ayahNumber ?? null
  const currentAyah = useMemo(() => {
    if (currentAyahNumber === null) return null
    return quranAyahs.find((a) => a.numberInSurah === currentAyahNumber) ?? null
  }, [quranAyahs, currentAyahNumber])

  // Listen for Howler audio errors via window ref
  useEffect(() => {
    const check = setInterval(() => {
      const howl = window.__howlRef
      if (howl && currentTrackIndex >= 0) {
        // @ts-expect-error
        if (howl._src && !howl.playing() && howl.state() === 'loaded') {
          setAudioError(false)
        }
      }
    }, 2000)
    return () => clearInterval(check)
  }, [currentTrackIndex])

  // Scroll current ayah into view
  useEffect(() => {
    if (currentAyahNumber !== null && ayahRefs.current[currentAyahNumber]) {
      ayahRefs.current[currentAyahNumber]?.scrollIntoView({
        behavior: "smooth", block: "center",
      })
    }
  }, [currentAyahNumber])

  const handlePlayAyah = useCallback((ayahNumber: number) => {
    const idx = currentQueue.findIndex(
      (t) => t.ayahNumber === ayahNumber && t.surahNumber === track?.surahNumber
    )
    if (idx !== -1) {
      setCurrentTrackIndex(idx)
      setIsPlaying(true)
    }
  }, [currentQueue, track?.surahNumber, setCurrentTrackIndex, setIsPlaying])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const howl = window.__howlRef
    if (howl?.state() === 'loaded') {
      const seekTime = pct * howl.duration()
      howl.seek(seekTime)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const surahName = track?.surahName || `Surah ${surahNumber}`

  const isBismillah = currentAyahNumber === 0

  return (
    <div className="flex flex-col h-full">
      {/* Ayah list */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-4 scrollbar-none px-1">
        {/* Bismillah decorative banner for non-Fatihah surahs */}
        {surahNumber !== 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handlePlayAyah(0)}
            className={cn(
              "relative p-6 rounded-2xl cursor-pointer transition-all duration-300 border text-center",
              isBismillah
                ? "bg-white/10 border-white/20 shadow-lg"
                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/15"
            )}
          >
            <p className="text-2xl md:text-3xl font-arabic leading-[2] mb-3" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <p className="text-xs text-white/50">
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </p>
            {currentAyahNumber !== 0 && (
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-play text-[10px] text-white/60 ml-0.5" />
              </div>
            )}
          </motion.div>
        )}

        {quranAyahs.map((ayah) => (
          <motion.div
            key={ayah.numberInSurah}
            ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (ayah.numberInSurah - 1) * 0.005, duration: 0.2 }}
            onClick={() => handlePlayAyah(ayah.numberInSurah)}
            className={cn(
              "group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border",
              currentAyahNumber === ayah.numberInSurah
                ? "bg-white/10 border-white/20 shadow-lg"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mb-2 transition-colors",
              currentAyahNumber === ayah.numberInSurah
                ? "bg-white text-black"
                : "bg-white/10 text-white/50"
            )}>
              {ayah.numberInSurah}
            </div>
            <p className="text-xl md:text-2xl font-arabic leading-[2] text-right mb-2" dir="rtl">
              {ayah.text}
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              {ayah.translation}
            </p>
            {currentAyahNumber !== ayah.numberInSurah && (
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-play text-[10px] text-white/60 ml-0.5" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom player bar */}
      <div className="shrink-0 pt-3 border-t border-white/10 space-y-2">
        {/* Progress bar */}
        <div className="w-full">
          <div
            className="relative w-full h-1 bg-white/10 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:bg-white transition-colors"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              style={{ left: `${progress}%`, marginLeft: '-6px' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/40 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">
              {surahName} · {isBismillah ? 'Bismillah' : `Ayah ${currentAyahNumber}`}
            </p>
            <p className="text-xs text-white/50 truncate mt-0.5" dir="rtl">
              {isBismillah ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : (currentAyah ? currentAyah.text.slice(0, 80) : "Select an ayah")}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <button
              onClick={playPrev}
              disabled={!currentAyahNumber || currentAyahNumber <= 0}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
            >
              <i className="fa-solid fa-backward-step text-sm" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={!currentAyah && !isBismillah}
              className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-30"
            >
              <i className={`fa-solid ${isPlaying ? "fa-pause" : "fa-play"} text-sm ${isPlaying ? "" : "ml-0.5"}`} />
            </button>
            <button
              onClick={playNext}
              disabled={currentAyahNumber === null || (currentAyahNumber >= quranAyahs.length && !isBismillah)}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
            >
              <i className="fa-solid fa-forward-step text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
