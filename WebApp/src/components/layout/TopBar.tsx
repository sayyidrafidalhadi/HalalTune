import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"

export default function TopBar() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-black/70 backdrop-blur-xl border-b border-white/5 shrink-0 z-10">
      <div className="flex items-center gap-3 md:hidden">
        <img src="/icon.png" alt="HalalTune" className="w-7 h-7 shrink-0 rounded-lg" />
        <span className="text-lg font-bold">HalalTune</span>
      </div>

      <div className="flex-1 md:flex-none" />

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => navigate("/search")}
          className="md:hidden"
        >
          <i className="fa-solid fa-magnifying-glass" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/search")}
          className="hidden md:flex items-center gap-2 px-4"
        >
          <i className="fa-solid fa-magnifying-glass text-sm" />
          <span>Search</span>
        </Button>

        {user ? (
          <motion.button
            onClick={() => navigate("/profile")}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-semibold text-sm hover:bg-white/20 transition-all overflow-hidden shrink-0"
            aria-label="Profile"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              (user.displayName?.charAt(0)?.toUpperCase()) || <i className="fa-solid fa-user text-xs text-white/60" />
            )}
          </motion.button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 px-4"
          >
            <i className="fa-solid fa-arrow-right-to-bracket text-sm" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        )}
      </div>
    </header>
  )
}
