import { useFormat, useTranslation } from "@workspace/i18n/react"
import {
  type ComponentProps,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
} from "react"

import { indianUnit } from "../../../lib/tools"

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

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: (ids: { input: string; hint: string }) => ReactNode
}) {
  const input = useId()
  const hintId = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={input} className="text-sm font-medium">
        {label}
      </label>
      {children({ input, hint: hintId })}
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground tabular-nums">
          {hint}
        </p>
      )}
    </div>
  )
}

export function ToolField({
  label,
  ...props
}: { label: string } & ComponentProps<"input">) {
  // plain elements: the ui Input pulls Base UI into every page's shared chunk
  return (
    <Field label={label}>
      {({ input }) => (
        <input
          id={input}
          {...props}
          className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base tabular-nums transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
        />
      )}
    </Field>
  )
}

const LAKH_GROUPS = new Intl.NumberFormat("en-IN")
const RUPEE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
})
  .formatToParts(0)
  .find((part) => part.type === "currency")?.value
const grouped = (digits: string) =>
  digits ? LAKH_GROUPS.format(Number(digits)) : ""

/** A rupee amount typed as 20,00,000 on a number pad, with "20 lakh" below it. */
export function ToolMoneyField({
  label,
  value,
  onValueChange,
}: {
  label: string
  /** Digits only. */
  value: string
  onValueChange: (digits: string) => void
}) {
  const { t } = useTranslation("blog")
  const format = useFormat()
  const ref = useRef<HTMLInputElement>(null)
  // digits left of the caret, so a comma that appears or goes doesn't throw it to the end
  const caret = useRef<number | null>(null)
  const unit = indianUnit(Number(value))

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || caret.current === null || document.activeElement !== el) return
    let seen = 0
    let at = 0
    while (at < el.value.length && seen < caret.current) {
      if (/\d/.test(el.value[at] ?? "")) seen++
      at++
    }
    el.setSelectionRange(at, at)
    caret.current = null
  })

  return (
    <Field
      label={label}
      hint={
        unit &&
        t(`mdx.money.${unit.unit}`, {
          value: format.number(unit.value, { maximumFractionDigits: 2 }),
        })
      }
    >
      {({ input, hint }) => (
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {RUPEE}
          </span>
          <input
            ref={ref}
            id={input}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="done"
            aria-describedby={unit ? hint : undefined}
            value={grouped(value)}
            onChange={(event) => {
              const el = event.target
              caret.current = el.value
                .slice(0, el.selectionStart ?? el.value.length)
                .replace(/\D/g, "").length
              onValueChange(
                el.value
                  .replace(/\D/g, "")
                  .replace(/^0+(?=\d)/, "")
                  .slice(0, 11)
              )
            }}
            className="h-11 w-full min-w-0 rounded-lg border border-input bg-background ps-7 pe-3 text-base tabular-nums transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
          />
        </div>
      )}
    </Field>
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
