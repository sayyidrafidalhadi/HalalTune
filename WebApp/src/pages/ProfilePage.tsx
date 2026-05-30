import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useLibraryStore } from "@/store/libraryStore"
import { logout } from "@/services/authService"

export default function ProfilePage() {
  const { user, likedSongIds, historyList, setUser, setLoading } = useAuthStore()
  const { tracks } = useLibraryStore()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const likedTracks = tracks.filter((t) => likedSongIds.has(t.id))

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setLoading(false)
      navigate("/auth", { replace: true })
    } catch {}
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    setStatusMsg(null)
    try {
      setUser({ ...user, displayName: displayName.trim() })
      setStatusMsg("Profile updated")
      setEditing(false)
    } catch {
      setStatusMsg("Failed to update profile")
    }
    setSaving(false)
    setTimeout(() => setStatusMsg(null), 3000)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <i className="fa-solid fa-user text-3xl text-white/30" />
        </div>
        <h1 className="text-xl font-bold">Not signed in</h1>
        <button
          onClick={() => navigate("/auth")}
          className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition-colors"
        >
          Sign in
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 max-w-2xl">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-5">
            <div className="shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-white/10">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.displayName?.charAt(0)?.toUpperCase()) || <i className="fa-solid fa-user text-white/40" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-lg font-bold focus:outline-none focus:border-white/40"
                  autoFocus
                />
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !displayName.trim()}
                  className="px-4 h-10 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                >
                  {saving ? "..." : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setDisplayName(user.displayName || "") }}
                  className="px-3 h-10 rounded-lg bg-white/10 text-white/60 text-sm hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{user.displayName || "User"}</h1>
                  <p className="text-sm text-white/50">{user.email || ""}</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/20 transition-all"
                  aria-label="Edit name"
                >
                  <i className="fa-solid fa-pen text-xs" />
                </button>
              </div>
            )}
            {statusMsg && (
              <p className="text-xs text-white mt-1">{statusMsg}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Liked", value: likedTracks.length, icon: "fa-heart", onClick: () => navigate("/library") },
          { label: "History", value: historyList.length, icon: "fa-clock-rotate", onClick: () => navigate("/library") },
          { label: "Playlists", value: 0, icon: "fa-list", onClick: () => navigate("/library") },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
          >
            <i className={`fa-solid ${stat.icon} text-white text-lg mb-2`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-white/50">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Account actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
        >
          <i className="fa-solid fa-gear text-white/50 w-6 text-center" />
          <span className="flex-1 font-medium">Settings</span>
          <i className="fa-solid fa-chevron-right text-white/30 text-sm" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors text-left"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-red-400 w-6 text-center" />
          <span className="flex-1 font-medium text-red-400">Sign out</span>
          <i className="fa-solid fa-chevron-right text-red-400/50 text-sm ml-auto" />
        </button>
      </div>

      {/* Account info */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30">Account</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">User ID</span>
            <span className="text-white/60 font-mono text-xs">{user.uid.slice(0, 16)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Email</span>
            <span className="text-white/60">{user.email || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Display name</span>
            <span className="text-white/60">{user.displayName || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
