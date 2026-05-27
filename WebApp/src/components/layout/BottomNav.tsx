import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

const navItems = [
  { path: "/", icon: "fa-house", label: "Home" },
  { path: "/search", icon: "fa-magnifying-glass", label: "Search" },
  { path: "/library", icon: "fa-book-open", label: "Library" },
  { path: "/quran", icon: "fa-book-quran", label: "Quran" },
  { path: "/podcasts", icon: "fa-podcast", label: "Podcasts" },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-bottom-nav z-[210] bg-black/55 backdrop-blur-[48px] border-t border-white/10 pb-[env(safe-area-inset-bottom)] flex items-stretch justify-around">
      {navItems.map((item) => {
        const active = location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path))
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 text-xs font-medium transition-all duration-200",
              active ? "text-white" : "text-white/40"
            )}
          >
            <i className={`fa-solid ${item.icon} text-lg transition-transform duration-200 ${active ? "scale-110" : ""}`} />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
