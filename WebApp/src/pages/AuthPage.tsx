import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { loginWithSpotify, loginWithEmail, registerWithEmail, resetPassword, mapSupabaseUser } from "@/services/authService"
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

  const handleSpotifyLogin = async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      await loginWithSpotify()
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Spotify login failed")
      setAuthLoading(false)
    }
  }

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

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs text-white/30">
            <span className="bg-black px-2">or continue with</span>
          </div>
        </div>

        <button
          onClick={handleSpotifyLogin}
          disabled={authLoading}
          className="w-full h-12 rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 text-white font-medium hover:bg-[#1DB954]/20 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Spotify
        </button>

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
