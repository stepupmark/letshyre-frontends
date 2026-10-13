import type { ReactNode } from "react"

interface ErrorScreenProps {
  title: string
  description?: string
  /** Status code or short label shown above the title. */
  code?: string | number
  /** Stack trace or message, for development only. */
  details?: string
  /** Buttons or links, e.g. "Go home". */
  children?: ReactNode
}

export function ErrorScreen({
  title,
  description,
  code,
  details,
  children,
}: ErrorScreenProps) {
  return (
    <section className="mx-auto flex min-h-[60svh] w-full max-w-xl flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      {code !== undefined && (
        <p className="font-mono text-sm text-muted-foreground">{code}</p>
      )}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-pretty text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      )}
      {details && (
        <pre className="max-h-64 w-full overflow-auto rounded-lg bg-muted p-4 text-start text-xs">
          {details}
        </pre>
      )}
    </section>
  )
}

export function NotFoundScreen(
  props: Omit<ErrorScreenProps, "code" | "details">
) {
  return <ErrorScreen code={404} {...props} />
}

// short stable id so a dev can match the screen to the console
export function errorId(error: unknown) {
  const text =
    error instanceof Error
      ? `${error.name}:${error.message}`
      : JSON.stringify(error)
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

/** Logs the error and returns the text for `details`. Development only. */
export function errorDetails(error: unknown) {
  const id = errorId(error)
  console.error(`[error ${id}]`, error)
  return [id, error instanceof Error ? error.stack : JSON.stringify(error)]
    .filter(Boolean)
    .join("\n\n")
}
