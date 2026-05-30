import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Howl } from "howler"
import { fetchSurahDetail } from "@/services/quranApi"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/shared"
import type { SurahDetail, AyahData } from "@/services/quranApi"

interface Props {
  surahNumber: number
  reciterId: string
  onClose: () => void
}

export default function QuranSurahView({ surahNumber, reciterId, onClose }: Props) {
  const [detail, setDetail] = useState<SurahDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentAyah, setCurrentAyah] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const howlRef = useRef<Howl | null>(null)
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    fetchSurahDetail(surahNumber, reciterId)
      .then((data) => {
        setDetail(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
    return () => {
      howlRef.current?.unload()
    }
  }, [surahNumber, reciterId])

  const playAyah = useCallback((ayah: AyahData) => {
    howlRef.current?.unload()
    setAudioError(false)

    const howl = new Howl({
      src: [ayah.audioUrl],
      html5: true,
      onplay: () => {
        setPlaying(true)
        setCurrentAyah(ayah.numberInSurah)
      },
      onend: () => {
        setPlaying(false)
        // Auto-advance if there's a next ayah
        if (detail && ayah.numberInSurah < detail.ayahs.length) {
          const next = detail.ayahs[ayah.numberInSurah]
          if (next) {
            playAyah(next)
          }
        }
      },
      onloaderror: () => {
        setAudioError(true)
        setPlaying(false)
      },
    })

    howlRef.current = howl
    howl.play()
  }, [detail])

  const togglePlay = useCallback((ayah: AyahData) => {
    if (howlRef.current && currentAyah === ayah.numberInSurah) {
      if (howlRef.current.playing()) {
        howlRef.current.pause()
        setPlaying(false)
      } else {
        howlRef.current.play()
        setPlaying(true)
      }
    } else {
      playAyah(ayah)
    }
  }, [currentAyah, playAyah])

  const playPrev = useCallback(() => {
    if (!detail || currentAyah === null) return
    const prevIndex = currentAyah - 2 // numberInSurah is 1-indexed
    if (prevIndex >= 0) {
      playAyah(detail.ayahs[prevIndex])
    }
  }, [detail, currentAyah, playAyah])

  const playNext = useCallback(() => {
    if (!detail || currentAyah === null) return
    const nextIndex = currentAyah // numberInSurah is 1-indexed
    if (nextIndex < detail.ayahs.length) {
      playAyah(detail.ayahs[nextIndex])
    }
  }, [detail, currentAyah, playAyah])

  // Scroll current ayah into view
  useEffect(() => {
    if (currentAyah !== null && ayahRefs.current[currentAyah]) {
      ayahRefs.current[currentAyah]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [currentAyah])

  const currentAyahData = detail?.ayahs.find((a) => a.numberInSurah === currentAyah)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <i className="fa-solid fa-triangle-exclamation text-4xl text-white/30" />
        <p className="text-white/50">Failed to load surah</p>
        <button onClick={onClose} className="px-6 py-2 rounded-full bg-white/10 text-sm hover:bg-white/20 transition-colors">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Back"
        >
          <i className="fa-solid fa-arrow-left text-sm" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{detail.name}</h2>
          <p className="text-xs text-white/40" dir="rtl">{detail.arabicName} · {detail.revelationType} · {detail.numberOfAyahs} verses</p>
        </div>
      </div>

      {/* Ayah list */}
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto pb-28 scrollbar-none">
        {detail.ayahs.map((ayah) => (
          <motion.div
            key={ayah.number}
            ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (ayah.numberInSurah - 1) * 0.01, duration: 0.2 }}
            onClick={() => togglePlay(ayah)}
            className={cn(
              "group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border",
              currentAyah === ayah.numberInSurah
                ? "bg-white/10 border-white/20 shadow-lg"
                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10"
            )}
          >
            {/* Ayah number badge */}
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mb-2 transition-colors",
              currentAyah === ayah.numberInSurah
                ? "bg-white text-black"
                : "bg-white/10 text-white/50"
            )}>
              {ayah.numberInSurah}
            </div>

            {/* Arabic text */}
            <p className="text-xl md:text-2xl font-arabic leading-[2] text-right mb-2" dir="rtl">
              {ayah.text}
            </p>

            {/* Translation */}
            <p className="text-sm text-white/60 leading-relaxed">
              {ayah.translation}
            </p>

            {/* Play icon overlay on hover */}
            {currentAyah !== ayah.numberInSurah && (
              <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <i className="fa-solid fa-play text-[10px] text-white/60 ml-0.5" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Bottom player controls */}
      <div className="fixed bottom-0 left-0 right-0 md:left-sidebar p-4 bg-black/80 backdrop-blur-xl border-t border-white/10 z-[50]">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Current ayah info */}
            <div className="flex-1 min-w-0">
              {currentAyahData ? (
                <>
                  <p className="text-sm font-semibold truncate">
                    {detail.name} · Ayah {currentAyahData.numberInSurah}
                  </p>
                  <p className="text-xs text-white/50 truncate" dir="rtl">
                    {currentAyahData.text.slice(0, 60)}...
                  </p>
                </>
              ) : (
                <p className="text-sm text-white/40">Tap an ayah to play</p>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={playPrev}
                disabled={!currentAyah || currentAyah <= 1}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
                aria-label="Previous ayah"
              >
                <i className="fa-solid fa-backward-step text-sm" />
              </button>

              <button
                onClick={() => currentAyahData && togglePlay(currentAyahData)}
                disabled={!currentAyahData}
                className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-30"
                aria-label={playing ? "Pause" : "Play"}
              >
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"} text-sm ${playing ? "" : "ml-0.5"}`} />
              </button>

              <button
                onClick={playNext}
                disabled={!currentAyah || (currentAyah >= (detail?.numberOfAyahs || 0))}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center disabled:opacity-30 transition-colors"
                aria-label="Next ayah"
              >
                <i className="fa-solid fa-forward-step text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {audioError && (
        <div className="fixed top-4 right-4 z-[60] px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          Audio unavailable for this reciter
        </div>
      )}
    </div>
  )
}
