import { lazy, Suspense } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import BottomNav from "./BottomNav"
import MiniPlayer from "./MiniPlayer"
import TopBar from "./TopBar"
import { usePlayerStore } from "@/store/playerStore"
import AudioEngine from "@/components/player/AudioEngine"

const FullScreenPlayer = lazy(() => import("./FullScreenPlayer"))
const QueueSidebar = lazy(() => import("./QueueSidebar"))
const MobilePlayer = lazy(() => import("@/components/player/MobilePlayer"))

export default function AppLayout() {
  const { currentTrack } = usePlayerStore()
  const hasTrack = !!currentTrack()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-b from-black via-black to-white/[0.03] text-white">
      <AudioEngine />
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <TopBar />

        <main className={`flex-1 overflow-y-auto overflow-x-hidden
          ${hasTrack
            ? "pb-[calc(70px+68px+env(safe-area-inset-bottom))]"
            : "pb-[calc(68px+env(safe-area-inset-bottom))]"}
          px-4 md:px-8 pt-4 md:pt-6`}
        >
          <Outlet />
        </main>

        <BottomNav />
        <MiniPlayer />
        <Suspense fallback={null}>
          <MobilePlayer />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <QueueSidebar />
        <FullScreenPlayer />
      </Suspense>
    </div>
  )
}
