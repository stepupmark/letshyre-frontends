import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function SummarySkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex flex-col gap-3"
    >
      <Skeleton className="my-0.5 h-5 w-20" />
      <div className="grid grid-cols-3 divide-x rounded-lg border">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2 p-3 sm:p-5">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-28 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
