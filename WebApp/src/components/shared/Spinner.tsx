import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-white/20 border-t-white",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}
