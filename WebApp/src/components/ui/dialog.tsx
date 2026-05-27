import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full max-w-lg bg-[#0a0a0d] border border-white/10 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center justify-between p-5 border-b border-white/10", className)} {...props} />
)

const DialogContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-bold text-white", className)} {...props} />
)

export { Dialog, DialogHeader, DialogContent, DialogTitle }
