import { Skeleton } from "@workspace/ui/components/skeleton"

export default function PostSkeletons() {
  return (
    <ol aria-hidden className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <li
          key={i}
          className="flex overflow-hidden rounded-xl border sm:flex-col"
        >
          <Skeleton className="w-24 shrink-0 rounded-none motion-reduce:animate-none sm:aspect-16/10 sm:w-auto" />
          <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
            <Skeleton className="h-4 w-20 motion-reduce:animate-none" />
            <Skeleton className="h-5 w-4/5 motion-reduce:animate-none" />
            <Skeleton className="h-4 w-full motion-reduce:animate-none" />
            <Skeleton className="h-4 w-2/3 motion-reduce:animate-none" />
          </div>
        </li>
      ))}
    </ol>
  )
}
