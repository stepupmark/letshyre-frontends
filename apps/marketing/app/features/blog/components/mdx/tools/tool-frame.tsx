import { type ComponentProps, type ReactNode, useId } from "react"

export function ToolFrame({
  title,
  note,
  fields,
  results,
}: {
  title: string
  note: string
  fields: ReactNode
  results: ReactNode
}) {
  const titleId = useId()
  return (
    <section
      aria-labelledby={titleId}
      data-wide=""
      data-no-listen=""
      className="my-4 flex flex-col gap-5 rounded-xl border p-5 text-base sm:p-6 print:break-inside-avoid"
    >
      <h3 id={titleId} className="text-lg font-semibold text-foreground">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">{fields}</div>
      <output
        aria-live="polite"
        className="grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-3"
      >
        {results}
      </output>
      <p className="text-sm text-pretty text-muted-foreground">{note}</p>
    </section>
  )
}

export function ToolField({
  label,
  ...props
}: { label: string } & ComponentProps<"input">) {
  const id = useId()
  // plain elements: the ui Input pulls Base UI into every page's shared chunk
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base tabular-nums transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
      />
    </div>
  )
}

export function ToolResult({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-xl font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </span>
  )
}
