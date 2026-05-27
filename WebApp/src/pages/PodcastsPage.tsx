import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const podcasts = [
  {
    title: "Islamic Guidance",
    host: "Mufti Menk",
    episodes: 42,
    color: "from-amber-900/30 to-black",
  },
  {
    title: "Seerah Stories",
    host: "Yasir Qadhi",
    episodes: 28,
    color: "from-emerald-900/30 to-black",
  },
  {
    title: "Faith & Reflection",
    host: "Omar Suleiman",
    episodes: 35,
    color: "from-blue-900/30 to-black",
  },
  {
    title: "Quran Tafseer",
    host: "Nouman Ali Khan",
    episodes: 56,
    color: "from-purple-900/30 to-black",
  },
]

export default function PodcastsPage() {
  return (
    <div className="space-y-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Podcasts</h1>
        <p className="text-white/50 text-sm">Islamic podcasts and lectures</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {podcasts.map((podcast) => (
          <motion.button
            key={podcast.title}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative p-5 rounded-2xl overflow-hidden text-left group",
              "bg-gradient-to-br border border-white/10",
              podcast.color
            )}
          >
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-3">
                <i className="fa-solid fa-podcast text-emerald-400" />
              </div>
              <h3 className="font-bold text-base mb-1">{podcast.title}</h3>
              <p className="text-sm text-white/50 mb-2">{podcast.host}</p>
              <p className="text-xs text-white/30">{podcast.episodes} episodes</p>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
