import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function ReportSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      aria-busy="true"
      aria-label={t("state.loading")}
      className="flex flex-col gap-12"
    >
      <div className="flex items-center gap-5">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  )
}
