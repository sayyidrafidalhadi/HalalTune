import * as React from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  side?: "left" | "right" | "bottom"
  className?: string
}

function Sheet({ open, onClose, children, side = "right", className }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  const sideClasses = {
    left: "left-0 top-0 h-full w-[300px]",
    right: "right-0 top-0 h-full w-[300px]",
    bottom: "bottom-0 left-0 w-full max-h-[85vh] rounded-t-2xl",
  }

  return (
    <div className="fixed inset-0 z-[400]">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed bg-[#0a0a0d] border-l border-white/10 shadow-2xl animate-in slide-in-from-right",
          sideClasses[side],
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Sheet }
