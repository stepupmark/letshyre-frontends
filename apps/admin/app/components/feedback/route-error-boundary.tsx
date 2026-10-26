import { isRouteErrorResponse, Link, useRouteError } from "react-router"
import { FileQuestion, TriangleAlert } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

import { EmptyState } from "./empty-state"

export function RouteErrorBoundary() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
        className="min-h-[60vh]"
        action={
          <Button nativeButton={false} render={<Link to="/dashboard" />}>
            Back to dashboard
          </Button>
        }
      />
    )
  }

  const details =
    import.meta.env.DEV && error instanceof Error ? error.message : undefined

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description={
        details ??
        "An unexpected error occurred. Try again, and contact support if it keeps happening."
      }
      className="min-h-[60vh]"
      action={
        <Button
          variant="outline"
          onClick={() => {
            window.location.reload()
          }}
        >
          Reload page
        </Button>
      }
    />
  )
}
