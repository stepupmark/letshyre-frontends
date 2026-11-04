import { Skeleton } from "@workspace/ui/components/skeleton"

export function LibrarySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6 border-b pb-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col rounded-lg border">
            <Skeleton className="h-44 rounded-b-none" />
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
