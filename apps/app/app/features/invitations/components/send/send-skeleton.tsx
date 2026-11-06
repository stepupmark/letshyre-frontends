import { Skeleton } from "@workspace/ui/components/skeleton"

export function SendSkeleton() {
  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex max-w-xl items-center gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <Skeleton className="h-3 flex-1" />
          </div>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="flex flex-col gap-2">
          <Skeleton className="mb-2 h-6 w-48" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg max-lg:hidden" />
      </div>
    </div>
  )
}
