import { useTranslation } from "@workspace/i18n/react"
import { Skeleton } from "@workspace/ui/components/skeleton"

export function TeamSkeleton() {
  const { t } = useTranslation("common")
  return (
    <div
      role="status"
      aria-label={t("state.loading")}
      className="flex flex-col gap-3"
    >
      <Skeleton className="my-0.5 h-4 w-40" />
      <ul className="divide-y rounded-lg border">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 p-4 sm:gap-4">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-48 max-w-full" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="size-7 max-md:size-11" />
          </li>
        ))}
      </ul>
    </div>
  )
}
