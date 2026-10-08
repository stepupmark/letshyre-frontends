import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { EmptyState } from "./empty-state"

interface ListEmptyStateProps {
  /** Plural, lower case, e.g. "candidates". */
  noun: string
  icon?: LucideIcon
  description: string
  action?: ReactNode
  filtered?: boolean
  onClearFilters?: () => void
}

export function ListEmptyState({
  noun,
  icon,
  description,
  action,
  filtered = false,
  onClearFilters,
}: ListEmptyStateProps) {
  if (filtered)
    return (
      <EmptyState
        icon={icon}
        title={`No ${noun} match your filters`}
        description="Try a different search or remove a filter."
        action={
          onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          )
        }
      />
    )

  return (
    <EmptyState
      icon={icon}
      title={`No ${noun} yet`}
      description={description}
      action={action}
    />
  )
}
