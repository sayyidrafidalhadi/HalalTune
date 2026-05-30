import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { APP_ICON } from "@/lib/constants"

export default function TopBar() {
  const navigate = useNavigate()

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-xl border-b border-white/5 shrink-0 z-10 md:hidden">
      <div className="flex items-center gap-3">
        <img src={APP_ICON} alt="HalalTune" className="w-7 h-7 shrink-0 rounded-lg" />
        <span className="text-lg font-bold">HalalTune</span>
      </div>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigate("/search")}
        aria-label="Search"
      >
        <i className="fa-solid fa-magnifying-glass" />
      </Button>
    </header>
  )
}
