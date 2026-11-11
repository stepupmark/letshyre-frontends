import { useTranslation } from "@workspace/i18n/react"
import { useId } from "react"

import type { Length } from "@/lib/blog/list"

export function LengthFilter({
  lengths,
  value,
  onChange,
}: {
  /** Only the lengths some post has. */
  lengths: readonly Length[]
  value: Length | undefined
  onChange: (length: Length | undefined) => void
}) {
  const { t } = useTranslation("blog")
  const labelId = useId()
  if (lengths.length < 2) return null
  const options = [undefined, ...lengths]

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        id={labelId}
        className="shrink-0 text-sm text-muted-foreground max-sm:sr-only"
      >
        {t("index.length")}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex scrollbar-none gap-0.5 overflow-x-auto rounded-lg border bg-background p-0.5"
      >
        {options.map((length) => (
          <button
            key={length ?? "any"}
            type="button"
            aria-pressed={value === length}
            onClick={() => {
              onChange(length)
            }}
            className="h-8 shrink-0 rounded-md px-3 text-sm text-muted-foreground transition-colors duration-200 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-brand-muted aria-pressed:font-medium aria-pressed:text-brand-text motion-reduce:transition-none"
          >
            {t(`length.${length ?? "any"}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
