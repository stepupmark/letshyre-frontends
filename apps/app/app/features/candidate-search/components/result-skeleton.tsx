import { Skeleton } from "@workspace/ui/components/skeleton"

export function ResultSkeleton() {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-start gap-4 rounded-xl border p-4">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-52" />
            <Skeleton className="h-2.5 w-28" />
            <div className="mt-1 flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 self-center rounded-full max-sm:hidden" />
        </li>
      ))}
    </ul>
  )
}
