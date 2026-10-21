import type { ReactNode } from "react"

import { Band } from "./band"
import { BandHeading } from "./band-heading"

export function ClosingBand({
  title,
  accent,
  description,
  flushTop,
  children,
}: {
  title: string
  accent: string
  description: string
  flushTop?: boolean
  children: ReactNode
}) {
  return (
    <Band id="final" flushTop={flushTop}>
      <div className="reveal rounded-3xl border border-brand/20 bg-brand-muted px-6 py-14 sm:px-12 sm:py-20">
        <BandHeading id="final-title" title={title} accent={accent} center />
        <p className="mx-auto mt-5 max-w-xl text-center text-lg text-pretty text-foreground/75">
          {description}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {children}
        </div>
      </div>
    </Band>
  )
}
