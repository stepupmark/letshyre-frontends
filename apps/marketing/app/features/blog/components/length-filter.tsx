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
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex flex-wrap items-center gap-2"
    >
      <span id={labelId} className="me-1 text-sm font-medium">
        {t("index.length")}
      </span>
      {options.map((length) => (
        <button
          key={length ?? "any"}
          type="button"
          aria-pressed={value === length}
          onClick={() => {
            onChange(length)
          }}
          className="h-8 rounded-full border bg-background px-3 text-sm transition-colors duration-200 outline-none hover:border-brand/40 focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background motion-reduce:transition-none"
        >
          {t(`length.${length ?? "any"}`)}
        </button>
      ))}
    </div>
  )
}
