"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { onAuthChange } from "@/services/authService"
import { useAuthStore } from "@/store/authStore"
import { Spinner } from "@/components/shared"

interface AuthGateContextType {
  initialized: boolean
}

const AuthGateContext = createContext<AuthGateContextType>({ initialized: false })

export function useAuthGate() {
  return useContext(AuthGateContext)
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || undefined,
          email: firebaseUser.email || undefined,
          photoURL: firebaseUser.photoURL || undefined,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
      setInitialized(true)
    })

    return unsubscribe
  }, [setUser, setLoading])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black" role="status" aria-label="Initializing">
        <Spinner size="lg" />
      </div>
    )
  }

  return <AuthGateContext.Provider value={{ initialized }}>{children}</AuthGateContext.Provider>
}
