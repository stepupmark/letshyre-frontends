import { Skeleton } from "@workspace/ui/components/skeleton"

export function ProfileSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <Skeleton className="size-16 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div aria-hidden="true" className="flex max-w-2xl flex-col gap-6">
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-56 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}
