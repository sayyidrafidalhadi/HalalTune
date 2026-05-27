import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { Spinner } from "@/components/shared"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
