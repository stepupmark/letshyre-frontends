import { cn } from "@workspace/ui/lib/utils"
import { type ReactNode } from "react"

/** A field cell of the compose window: label on top, then the field and its error. */
export function ComposeField({
  htmlFor,
  label,
  error,
  errorId,
  className,
  children,
}: {
  htmlFor: string
  label: string
  error?: string
  errorId: string
  className?: string
  children: ReactNode
}) {
  return (
    <div
      data-invalid={error ? true : undefined}
      className={cn(
        "flex min-w-0 flex-col gap-1 px-5 py-3.5 transition-colors duration-200 ring-inset data-invalid:ring-1 data-invalid:ring-destructive/40 sm:px-6",
        className
      )}
    >
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground in-data-invalid:text-destructive"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
