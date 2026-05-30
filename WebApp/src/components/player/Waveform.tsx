import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/playerStore'

const BAR_COUNT = 64
const BAR_MIN = 0.05
const BAR_MAX = 1

export default function Waveform({ animated = true, barCount = BAR_COUNT, className = '' }: {
  animated?: boolean
  barCount?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const isPlaying = usePlayerStore((s) => s.isPlaying)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const values = new Float32Array(barCount).fill(BAR_MIN)

    function draw() {
      if (!ctx || !canvas) return
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)

      const gap = 2
      const barW = (w - gap * (barCount - 1)) / barCount

      if (isPlaying && animated) {
        for (let i = 0; i < barCount; i++) {
          const target = BAR_MIN + Math.random() * (BAR_MAX - BAR_MIN)
          values[i] += (target - values[i]) * 0.15
        }
      } else {
        for (let i = 0; i < barCount; i++) {
          values[i] += (BAR_MIN - values[i]) * 0.05
        }
      }

      for (let i = 0; i < barCount; i++) {
        const barH = Math.max(2, values[i] * h)
        const x = i * (barW + gap)
        const y = (h - barH) / 2
        const alpha = 0.3 + values[i] * 0.7
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(x, y, Math.max(1, barW), barH, Math.max(0, barW / 2))
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animated, barCount, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
    />
  )
}
