import { useLocation, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"

const navItems = [
  { path: "/", icon: "fa-house", label: "Home" },
  { path: "/library", icon: "fa-book-open", label: "Library" },
  { path: "/quran", icon: "fa-book-quran", label: "Quran" },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const profileLabel = user ? (user.displayName?.split(" ")[0] || "Profile") : "Profile"
  const profileIcon = user ? "fa-user" : "fa-arrow-right-to-bracket"

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
      <button
        onClick={() => navigate(user ? "/profile" : "/auth")}
        className={cn(
          "flex flex-col items-center justify-center gap-1 flex-1 text-xs font-medium transition-all duration-200",
          location.pathname === "/profile" || location.pathname === "/auth" ? "text-white" : "text-white/40"
        )}
      >
        {user && user.photoURL ? (
          <div className="w-5 h-5 rounded-full overflow-hidden">
            <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <i className={`fa-solid ${profileIcon} text-lg transition-transform duration-200 ${location.pathname === "/profile" ? "scale-110" : ""}`} />
        )}
        <span>{profileLabel}</span>
      </button>
    </nav>
  )
}
