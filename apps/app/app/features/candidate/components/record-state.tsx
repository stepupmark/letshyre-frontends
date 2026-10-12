import { HttpError } from "@workspace/api"
import type { UseQueryResult } from "@tanstack/react-query"
import type { ReactNode } from "react"

import { AppLink } from "@/components/app-link"
import { EmptyState } from "@/components/empty-state"
import { LoadError } from "@/components/query-state"
import { useDelayed } from "@/hooks/use-delayed"
import { buttonLink } from "@/lib/button-link"

import { ReportSkeleton } from "./report-skeleton"

/** A profile or scorecard: missing, failed, loading or ready. */
export function RecordState<T>({
  valid,
  query,
  missing,
  children,
}: {
  valid: boolean
  query: UseQueryResult<T>
  missing: { title: string; body: string; back: string; to: string }
  children: (data: T) => ReactNode
}) {
  const skeleton = useDelayed(valid && query.isPending)

  if (valid && query.data !== undefined) return children(query.data)
  const gone =
    !valid ||
    (query.error instanceof HttpError &&
      [400, 403, 404].includes(query.error.status))
  if (gone)
    return (
      <EmptyState
        title={missing.title}
        description={missing.body}
        action={
          <AppLink
            to={missing.to}
            className={buttonLink({ variant: "outline" })}
          >
            {missing.back}
          </AppLink>
        }
      />
    )
  if (query.isError)
    return (
      <LoadError
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    )
  return skeleton ? <ReportSkeleton /> : null
}
