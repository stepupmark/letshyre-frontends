import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import type { UseQueryResult } from "@tanstack/react-query"
import { RotateCw } from "lucide-react"
import type { ReactNode } from "react"

import { useDelayed } from "@/hooks/use-delayed"

/**
 * Loading, error and data for one query. The skeleton waits 300 ms so fast
 * answers don't flash; a failed refetch keeps showing the last good data.
 */
export function QueryState<T>({
  query,
  skeleton,
  children,
}: {
  query: Pick<
    UseQueryResult<T>,
    "data" | "isPending" | "isError" | "refetch" | "isRefetching"
  >
  skeleton: ReactNode
  children: (data: T) => ReactNode
}) {
  const showSkeleton = useDelayed(query.isPending)

  if (query.data !== undefined) return children(query.data)
  if (query.isError) {
    return (
      <LoadError
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    )
  }
  return showSkeleton ? skeleton : null
}

export function LoadError({
  onRetry,
  retrying = false,
}: {
  onRetry: () => void
  retrying?: boolean
}) {
  const { t } = useTranslation("common")
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border p-6"
    >
      <div>
        <p className="font-medium">{t("state.error")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("state.errorBody")}
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
        <RotateCw
          className={
            retrying ? "animate-spin motion-reduce:animate-none" : undefined
          }
        />
        {t("state.retry")}
      </Button>
    </div>
  )
}
