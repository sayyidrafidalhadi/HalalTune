import { lazy, Suspense, Component } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { PageLoader } from "@/components/shared"
import { AuthGate } from "@/components/auth/AuthGate"

const AppLayout = lazy(() => import("@/components/layout/AppLayout"))
const HomePage = lazy(() => import("@/pages/HomePage"))
const SearchPage = lazy(() => import("@/pages/SearchPage"))
const LibraryPage = lazy(() => import("@/pages/LibraryPage"))
const QuranPage = lazy(() => import("@/pages/QuranPage"))
const PlaylistPage = lazy(() => import("@/pages/PlaylistPage"))
const ArtistPage = lazy(() => import("@/pages/ArtistPage"))
const AlbumPage = lazy(() => import("@/pages/AlbumPage"))
const ProfilePage = lazy(() => import("@/pages/ProfilePage"))
const SettingsPage = lazy(() => import("@/pages/SettingsPage"))
const AuthPage = lazy(() => import("@/pages/AuthPage"))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    console.error("App Error:", error)
    console.error("Component Stack:", info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: "100vw", height: "100vh",
          backgroundColor: "#000", color: "#fff",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: 40, fontFamily: "sans-serif"
        }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 16 }}>
            Something went wrong
          </h1>
          <pre style={{ color: "#ef4444", fontSize: 14, marginBottom: 16, maxWidth: "80vw", overflow: "auto" }}>
            {this.state.error?.message}
          </pre>
          <pre style={{ fontSize: 11, color: "#888", maxWidth: "80vw", overflow: "auto", maxHeight: "50vh" }}>
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/quran" element={<QuranPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/playlist/:id" element={<PlaylistPage />} />
                  <Route path="/artist/:id" element={<ArtistPage />} />
                  <Route path="/album/:id" element={<AlbumPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthGate>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
