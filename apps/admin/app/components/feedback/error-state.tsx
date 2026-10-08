import { RotateCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getErrorMessage } from "@/lib/errors"
import { EmptyState } from "./empty-state"

interface ErrorStateProps {
  title?: string
  error?: unknown
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Couldn't load this",
  error,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title={title}
      description={getErrorMessage(error)}
      className={className}
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw /> Try again
          </Button>
        )
      }
    />
  )
}
