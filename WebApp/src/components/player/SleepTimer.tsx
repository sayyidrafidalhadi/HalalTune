import { motion } from 'framer-motion'
import { usePlayerStore } from '@/store/playerStore'
import { cn } from '@/lib/utils'

const TIMER_OPTIONS = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
]

export default function SleepTimer({ onClose }: { onClose?: () => void }) {
  const { sleepTimer, setSleepTimer, clearSleepTimer } = usePlayerStore()

  const minutesLeft = sleepTimer.endTime
    ? Math.max(0, Math.floor((sleepTimer.endTime - Date.now()) / 60000))
    : 0

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Sleep Timer</h3>
        {onClose && (
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        )}
      </div>

      {sleepTimer.endTime ? (
        <div className="text-center py-6 space-y-4">
          <div className="text-5xl font-bold text-white">{minutesLeft}</div>
          <p className="text-white/50 text-sm">minutes remaining</p>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-4">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{
                width: `${(minutesLeft / sleepTimer.initialMinutes) * 100}%`,
              }}
            />
          </div>
          <button
            onClick={clearSleepTimer}
            className="mt-6 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
          >
            Cancel Timer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {TIMER_OPTIONS.map((opt) => (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSleepTimer(opt.value)}
              className={cn(
                'py-3 px-4 rounded-xl text-sm font-medium transition-all',
                'bg-white/5 hover:bg-white/10 border border-white/5',
                'hover:border-white/30 active:bg-white/10'
              )}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      )}
      <p className="text-xs text-white/30 text-center mt-6">
        Music will pause when the timer ends
      </p>
    </div>
  )
}
