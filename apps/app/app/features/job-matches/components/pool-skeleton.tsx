import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function PoolSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex w-full flex-col gap-2 sm:max-w-sm">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-8 w-44" />
      </div>
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-10" />
      </div>
      <div className="flex flex-col divide-y rounded-lg border">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="hidden h-5 w-24 rounded-full md:block" />
            <Skeleton className="hidden h-3 w-56 lg:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
