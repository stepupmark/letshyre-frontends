import { Skeleton } from "@workspace/ui/components/skeleton"

export function ResultSkeleton() {
  return (
    <ul aria-hidden="true" className="flex max-w-5xl flex-col gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="flex items-center gap-4 rounded-xl border px-4 py-3 sm:px-5"
        >
          <Skeleton className="size-14 self-start rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-64 max-w-full" />
            <div className="mt-1 flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md max-sm:hidden" />
            </div>
          </div>
          <Skeleton className="h-3 w-40 max-sm:hidden" />
        </li>
      ))}
    </ul>
  )
}
