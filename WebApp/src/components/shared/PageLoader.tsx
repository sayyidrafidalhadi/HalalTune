import { PageSkeleton } from "./Skeleton"

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <PageSkeleton />
    </div>
  )
}
