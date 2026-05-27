import { motion } from "framer-motion"
import { usePlayerStore } from "@/store/playerStore"

const categories = [
  { key: "arabic", label: "Arabic", color: "bg-amber-500" },
  { key: "malayalam", label: "Malayalam", color: "bg-emerald-500" },
  { key: "english", label: "English", color: "bg-blue-500" },
  { key: "urdu", label: "Urdu", color: "bg-purple-500" },
  { key: "others", label: "Others", color: "bg-gray-500" },
]

export default function SettingsPage() {
  const { volume, setVolume } = usePlayerStore()

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Settings</h1>
        <p className="text-white/50 text-sm">Customize your experience</p>
      </motion.div>

      {/* Playback */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Playback</h2>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Volume</label>
              <span className="text-xs text-white/50">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Content</h2>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm font-medium mb-3">Language Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium"
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                {cat.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">About</h2>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Version</span>
            <span>2.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Platform</span>
            <span>Web</span>
          </div>
        </div>
      </section>
    </div>
  )
}
