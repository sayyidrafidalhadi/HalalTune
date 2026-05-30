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
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 md:w-28 md:h-28 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      {/* Cards row */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[150px] shrink-0 space-y-2">
              <Skeleton className="aspect-square rounded-2xl" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-2.5 w-3/5" />
            </div>
          ))}
        </div>
      </div>
      {/* Track rows */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <TrackRowSkeleton key={i} />
          ))}
        </div>
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
