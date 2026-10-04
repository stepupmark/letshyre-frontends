import { Button } from "@workspace/ui/components/button"
import { RotateCw } from "lucide-react"

export function LoadError({
  what,
  onRetry,
}: {
  what: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border p-6"
    >
      <div>
        <p className="font-medium">Couldn't load {what}.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nothing was lost. Check your connection and try again.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw />
        Try again
      </Button>
    </div>
  )
}
