import { cn } from "@/lib/utils"

interface AlbumArtProps {
  src?: string
  alt?: string
  className?: string
  icon?: string
  iconClass?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "w-10 h-10 rounded-lg",
  md: "w-12 h-12 rounded-lg",
  lg: "w-48 h-48 rounded-2xl",
  xl: "w-full aspect-square rounded-2xl",
}

const iconSizes = {
  sm: "text-xs",
  md: "text-lg",
  lg: "text-4xl",
  xl: "text-6xl",
}

export function AlbumArt({ src, alt = "", className, icon = "fa-music", iconClass, size = "sm" }: AlbumArtProps) {
  if (src) {
    return (
      <div className={cn("shrink-0 overflow-hidden", sizeClasses[size], className)}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "shrink-0 overflow-hidden bg-white/5 flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      <i className={cn(
        "fa-solid text-white/20",
        iconSizes[size],
        icon,
        iconClass
      )} />
    </div>
  )
}
