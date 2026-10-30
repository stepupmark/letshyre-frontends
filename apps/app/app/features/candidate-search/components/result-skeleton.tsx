import { Skeleton } from "@workspace/ui/components/skeleton"

export function ResultSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid gap-4 lg:grid-cols-5 lg:items-start"
    >
      <ul className="divide-y rounded-xl border lg:col-span-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-2.5 w-24" />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-5 rounded-xl border p-5 max-lg:hidden lg:col-span-3">
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
