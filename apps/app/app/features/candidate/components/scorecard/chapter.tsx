import * as m from "motion/react-m"
import type { ReactNode } from "react"

import { duration, ease } from "@/lib/motion"

import { ChapterGlyph, type ChapterId } from "../art/chapter-glyphs"

export function Chapter({
  id,
  number,
  title,
  hint,
  action,
  children,
}: {
  id: ChapterId
  number: number
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <m.section
      id={id}
      aria-labelledby={`${id}-title`}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: duration.base, ease }}
      className="flex break-inside-avoid-page flex-col gap-5 print:transform-none! print:opacity-100!"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-muted">
          <ChapterGlyph id={id} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2
            id={`${id}-title`}
            tabIndex={-1}
            className="flex items-baseline gap-2 text-lg font-semibold tracking-tight text-balance text-brand-text outline-none"
          >
            <span className="text-sm font-medium text-muted-foreground tabular-nums">
              {String(number).padStart(2, "0")}
            </span>
            {title}
          </h2>
          {hint && (
            <p className="text-sm text-pretty text-muted-foreground">{hint}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </m.section>
  )
}
