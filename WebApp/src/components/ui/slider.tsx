import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number
  max?: number
  onChange: (value: number) => void
  className?: string
  trackClassName?: string
  thumbClassName?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, max = 100, onChange, className, trackClassName, thumbClassName }, ref) => {
    return (
      <div className={cn("relative w-full h-2 group cursor-pointer", className)}>
        <input
          ref={ref}
          type="range"
          value={value}
          max={max}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={cn(
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
            thumbClassName
          )}
        />
        <div className={cn(
          "absolute inset-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/20 group-hover:h-1.5 transition-all",
          trackClassName
        )}>
          <div
            className="h-full rounded-full bg-white group-hover:bg-emerald-400 transition-colors"
            style={{ width: `${(value / max) * 100}%` }}
          />
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
