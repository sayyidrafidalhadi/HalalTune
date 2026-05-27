import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, ...props }, ref) => {
    const [error, setError] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full bg-white/10",
          className
        )}
        {...props}
      >
        {src && !error ? (
          <img
            src={src}
            alt={alt || ""}
            className="aspect-square h-full w-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-white/50">
            {fallback || alt?.charAt(0)?.toUpperCase() || "?"}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
