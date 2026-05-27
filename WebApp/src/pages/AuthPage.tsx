import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { loginWithEmail, registerWithEmail, resetPassword, mapSupabaseUser } from "@/services/authService"
import { APP_ICON } from "@/lib/constants"

type AuthView = "login" | "register" | "forgot"

export default function AuthPage() {
  const navigate = useNavigate()
  const { setUser, user } = useAuthStore()
  const [view, setView] = useState<AuthView>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    if (user) {
      navigate("/profile", { replace: true })
    }
  }, [user, navigate])

  if (user) return null

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      if (view === "register") {
        const supabaseUser = await registerWithEmail(email, password, displayName)
        setUser(mapSupabaseUser(supabaseUser))
      } else {
        const supabaseUser = await loginWithEmail(email, password)
        setUser(mapSupabaseUser(supabaseUser))
      }
      navigate("/profile", { replace: true })
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Authentication failed")
    }
    setAuthLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Failed to send reset email")
    }
    setAuthLoading(false)
  }

  const viewTitle = view === "login" ? "Welcome back" : view === "register" ? "Create account" : "Reset password"
  const viewDesc = view === "login"
    ? "Sign in to access your library and sync across devices"
    : view === "register"
    ? "Register to save your favorites and playlists"
    : "Enter your email and we'll send you a reset link"

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] pb-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <img src={APP_ICON} alt="HalalTune" className="w-14 h-14 rounded-2xl mx-auto mb-2 shadow-xl" />
          <h1 className="text-2xl font-bold">{viewTitle}</h1>
          <p className="text-sm text-white/50">{viewDesc}</p>
        </div>

        <AnimatePresence mode="wait">
          {view === "forgot" ? (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >
              {resetSent ? (
                <div className="text-center space-y-4 py-8">
                  <i className="fa-solid fa-paper-plane text-white text-4xl" />
                  <p className="text-sm text-white/60">Reset link sent! Check your email.</p>
                  <button
                    onClick={() => { setView("login"); setResetSent(false) }}
                    className="text-sm text-white hover:text-white/70 transition-colors"
                  >
                    Back to sign in
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    required
                  />
                  {authError && <p className="text-sm text-red-400">{authError}</p>}
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full h-12 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
                  >
                    {authLoading ? "Sending..." : "Send reset link"}
                  </button>
                  <button
                    onClick={() => { setView("login"); setAuthError(null) }}
                    className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </motion.form>
          ) : (
            <motion.form
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailAuth}
              className="space-y-4"
            >
              {view === "register" && (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  required
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength={6}
                className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                required
              />

              {view === "login" && (
                <button
                  type="button"
                  onClick={() => { setView("forgot"); setAuthError(null) }}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Forgot password?
                </button>
              )}

              {authError && <p className="text-sm text-red-400">{authError}</p>}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full h-12 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {authLoading ? "Please wait..." : view === "register" ? "Create account" : "Sign in"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="text-center">
          {view === "login" ? (
            <p className="text-sm text-white/40">
              No account?{" "}
              <button onClick={() => { setView("register"); setAuthError(null) }} className="text-white hover:text-white/80 font-medium transition-colors">
                Register
              </button>
            </p>
          ) : view === "register" ? (
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <button onClick={() => { setView("login"); setAuthError(null) }} className="text-white hover:text-white/80 font-medium transition-colors">
                Sign in
              </button>
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}
