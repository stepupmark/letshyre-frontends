import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function ReportSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      aria-busy="true"
      aria-label={t("state.loading")}
      className="grid gap-14 xl:grid-cols-[12rem_minmax(0,1fr)] xl:gap-x-12"
    >
      <div aria-hidden="true" className="hidden xl:row-span-2 xl:block" />
      <div className="flex flex-col gap-8 rounded-2xl border p-5 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full sm:size-28" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-48" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  )
}
