import { Skeleton } from "@workspace/ui/components/skeleton"

export function ResultSkeleton() {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex flex-col gap-4 rounded-xl border p-4 sm:p-5"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3.5 w-56" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <Skeleton className="h-8 w-24 max-sm:hidden" />
          </div>
          <div className="flex gap-2 border-t pt-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  )
}
