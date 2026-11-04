import { Skeleton } from "@workspace/ui/components/skeleton"

export function LibrarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-3 h-8 w-32" />
        </div>
      ))}
    </div>
  )
}
