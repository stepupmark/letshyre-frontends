import { useLocale } from "@workspace/i18n/react"

import { rupeeParts } from "../../lib/money"

export function Price({ value }: { value: number }) {
  const locale = useLocale()
  return (
    <span className="inline-flex items-baseline text-4xl font-semibold tracking-tight tabular-nums">
      {rupeeParts(locale, value, true).map((part, i) =>
        part.symbol ? (
          <span
            key={i}
            className="me-0.5 text-2xl font-medium text-muted-foreground"
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  )
}
