import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "@/store/authStore"
import { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } from "@/services/authService"

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

  const handleGoogleLogin = async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const firebaseUser = await loginWithGoogle()
      setUser({
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || undefined,
        email: firebaseUser.email || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      })
      navigate("/profile", { replace: true })
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : "Google login failed")
    }
    setAuthLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)
    setAuthLoading(true)
    try {
      if (view === "register") {
        const firebaseUser = await registerWithEmail(email, password, displayName)
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        })
      } else {
        const firebaseUser = await loginWithEmail(email, password)
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        })
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
          <img src="/icon.png" alt="HalalTune" className="w-14 h-14 rounded-2xl mx-auto mb-2 shadow-xl" />
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
                  <i className="fa-solid fa-paper-plane text-emerald-400 text-4xl" />
                  <p className="text-sm text-white/60">Reset link sent! Check your email.</p>
                  <button
                    onClick={() => { setView("login"); setResetSent(false) }}
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
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
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
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
