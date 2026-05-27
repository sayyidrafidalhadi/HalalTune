import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import type { LyricsLine } from '@/types'

const SAMPLE_LYRICS: LyricsLine[] = [
  { time: 0, text: "♪" },
  { time: 5, text: "In the silence of the night" },
  { time: 10, text: "I hear Your call so clear and bright" },
  { time: 15, text: "Guide my heart and light my way" },
  { time: 20, text: "With every breath, I kneel and pray" },
  { time: 25, text: "Your mercy flows like morning dew" },
  { time: 30, text: "Your love is endless, pure, and true" },
  { time: 35, text: "I raise my hands to the sky above" },
  { time: 40, text: "Filled with gratitude and love" },
  { time: 45, text: "SubhanAllah, Alhamdulillah" },
  { time: 50, text: "La ilaha illallah, Allahu Akbar" },
  { time: 55, text: "In every heartbeat, in every sigh" },
  { time: 60, text: "I feel Your presence drawing nigh" },
  { time: 65, text: "Guide me through the darkest night" },
  { time: 70, text: "To Your eternal, glorious light" },
]

export default function LyricsPanel({ lyrics: propLyrics }: { lyrics?: LyricsLine[] }) {
  const currentTime = usePlayerStore((s) => s.currentTime)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(-1)

  const lyrics = propLyrics && propLyrics.length > 0 ? propLyrics : SAMPLE_LYRICS

  useEffect(() => {
    let idx = -1
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        idx = i
        break
      }
    }
    setActiveIdx(idx)
  }, [currentTime, lyrics])

  useEffect(() => {
    if (activeIdx < 0 || !containerRef.current) return
    const children = containerRef.current.children
    if (children[activeIdx]) {
      children[activeIdx].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeIdx])

  if (lyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        No lyrics available
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-8 space-y-5"
    >
      {lyrics.map((line, i) => {
        const isActive = i === activeIdx
        const isPast = i < activeIdx
        return (
          <motion.p
            key={i}
            animate={{
              opacity: isActive ? 1 : isPast ? 0.35 : 0.5,
              scale: isActive ? 1.05 : 1,
            }}
            className={`text-center transition-colors duration-500 leading-relaxed ${
              isActive
                ? 'text-white text-xl font-semibold'
                : 'text-white/40 text-base'
            }`}
          >
            {line.text}
          </motion.p>
        )
      })}
    </div>
  )
}
