import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function ScorecardsSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      aria-busy="true"
      aria-label={t("state.loading")}
      className="flex flex-col gap-8"
    >
      <div className="grid gap-8 rounded-lg border bg-card p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-12">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-56 max-w-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="grid max-w-sm grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-1.5 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="flex items-center gap-5 border-t pt-4">
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
        </div>
        <div className="flex flex-col justify-end gap-3 max-lg:hidden">
          <Skeleton className="h-3 w-32" />
          <div className="flex h-20 items-end gap-1.5">
            <Skeleton className="h-1/3 w-6 rounded-b-none" />
            <Skeleton className="h-2/3 w-6 rounded-b-none" />
            <Skeleton className="h-1/3 w-6 rounded-b-none" />
            <Skeleton className="h-full w-6 rounded-b-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36" />
        <div className="divide-y rounded-lg border bg-card">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex min-h-14 items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24 max-sm:hidden" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
