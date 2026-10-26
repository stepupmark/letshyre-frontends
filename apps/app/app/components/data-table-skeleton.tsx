import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function TableSkeleton({ columns }: { columns: number }) {
  const { t } = useTranslation("common")
  const cells = Array.from({ length: Math.max(columns - 2, 0) }, (_, i) => i)
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex flex-col gap-3"
    >
      <Skeleton className="my-1.5 h-4 w-24" />
      <div className="hidden divide-y rounded-lg border md:block">
        <div className="flex h-10 items-center gap-6 px-3">
          <Skeleton className="h-3 w-20" />
          {cells.map((i) => (
            <Skeleton key={i} className="h-3 max-w-16 flex-1" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center gap-6 px-3 py-3.5">
            <div className="flex w-48 shrink-0 items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            {cells.map((i) => (
              <Skeleton key={i} className="h-3.5 max-w-20 flex-1" />
            ))}
            <Skeleton className="ms-auto h-7 w-24" />
          </div>
        ))}
      </div>
      <ul className="flex flex-col gap-2 md:hidden">
        {[0, 1, 2].map((row) => (
          <li key={row} className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-11 w-full" />
          </li>
        ))}
      </ul>
    </div>
  )
}
