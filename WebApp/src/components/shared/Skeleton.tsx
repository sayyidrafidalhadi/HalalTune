import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/10", className)}
      aria-hidden="true"
    />
  )
}

export function TrackRowSkeleton({ dense = false }: { dense?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className={cn("shrink-0 rounded-lg", dense ? "w-8 h-8" : "w-10 h-10")} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-3 w-10 shrink-0" />
    </div>
  )
}

export function TrackGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2.5">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <TrackRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="w-[170px] shrink-0 space-y-2.5">
          <Skeleton className="aspect-square rounded-2xl" />
          <Skeleton className="h-3.5 w-4/5" />
          <Skeleton className="h-3 w-3/5" />
        </div>
      ))}
    </div>
  )
}
