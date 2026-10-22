import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function CompareSkeleton({ count }: { count: number }) {
  const { t } = useTranslation("common")
  const columns = Array.from({ length: count }, (_, i) => i)
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="overflow-hidden rounded-lg border"
    >
      <div className="flex gap-4 border-b p-4">
        <span className="w-44 shrink-0 max-sm:w-24" />
        {columns.map((i) => (
          <div key={i} className="flex flex-1 items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-8 rounded-none" />
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <div
          key={row}
          className="flex items-center gap-4 border-b p-4 last:border-0"
        >
          <span className="w-44 shrink-0 max-sm:w-24">
            <Skeleton className="h-3.5 w-28 max-w-full" />
          </span>
          {columns.map((i) => (
            <div key={i} className="flex flex-1 items-center gap-3">
              <Skeleton className="h-3.5 w-6" />
              <Skeleton className="h-1.5 flex-1 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
