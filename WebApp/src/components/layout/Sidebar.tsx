import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"
import { APP_ICON } from "@/lib/constants"
import { logout } from "@/services/authService"

const navItems = [
  { path: "/", icon: "fa-house", label: "Home" },
  { path: "/search", icon: "fa-magnifying-glass", label: "Search" },
  { path: "/library", icon: "fa-book-open", label: "Library" },
  { path: "/quran", icon: "fa-book-quran", label: "Quran" },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser, setLoading } = useAuthStore()

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/"
    return location.pathname.startsWith(path)
  }

  const handleSignOut = async () => {
    try {
      await logout()
      setUser(null)
      setLoading(false)
    } catch {}
  }

  return (
    <aside className="hidden md:flex flex-col w-sidebar bg-black border-r border-white/10 shrink-0 h-full">
      <div className="flex items-center gap-3 px-4 pt-6 pb-8">
        <img src={APP_ICON} alt="HalalTune" className="w-8 h-8 shrink-0 rounded-lg" />
        <h2 className="text-xl font-extrabold tracking-tight">HalalTune</h2>
      </div>

      <nav className="flex flex-col gap-1 px-2 flex-1">
        {navItems.map((item) => {
          const active = isActive(item.path)
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden will-change-transform",
                active
                  ? "text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-white/10 border-l-2 border-white"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-4">
                <i className={`fa-solid ${item.icon} ${active ? "text-white" : "text-white/50"} w-5 text-center`} />
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </nav>

      <div className="px-2 pt-4 border-t border-white/10 space-y-1">
        <motion.button
          onClick={() => navigate("/profile")}
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 will-change-transform",
            isActive("/profile")
              ? "text-white bg-white/5"
              : "text-white/50 hover:text-white hover:bg-white/5"
          )}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="fa-solid fa-user w-5 text-center" />
          Profile
        </motion.button>

        <motion.button
          onClick={() => navigate("/settings")}
          className={cn(
            "flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 will-change-transform",
            isActive("/settings")
              ? "text-white bg-white/5"
              : "text-white/50 hover:text-white hover:bg-white/5"
          )}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <i className="fa-solid fa-gear w-5 text-center" />
          Settings
        </motion.button>

        {user && (
          <motion.button
            onClick={handleSignOut}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-200 will-change-transform"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Sign out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center" />
            Sign Out
          </motion.button>
        )}
      </div>
    </aside>
  )
}
