import type { ReactNode } from "react"

import { Container } from "./section"

/** The h1 band for a page aimed at one audience, with a product scene beside it. */
export function AudienceHero({
  eyebrow,
  title,
  accent,
  description,
  actions,
  note,
  art,
}: {
  eyebrow: string
  title: string
  accent: string
  description: string
  actions: ReactNode
  note: string
  art: ReactNode
}) {
  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="grid grid-cols-1 items-center gap-14 pt-10 pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pt-20 lg:pb-24">
        <div className="flex flex-col items-start">
          <p className="inline-flex items-center gap-2 rounded-full border bg-brand-muted px-3 py-1 text-sm font-medium text-brand-text">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            {eyebrow}
          </p>
          <h1
            id="hero-title"
            className="mt-6 text-5xl font-semibold tracking-tight text-balance sm:text-6xl"
          >
            {title}{" "}
            <span className="relative inline-block text-brand-text">
              {accent}
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                fill="none"
                className="absolute inset-x-0 -bottom-2 h-3 w-full text-brand"
              >
                <path
                  pathLength={1}
                  d="M3 9C48 4 120 2 197 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="ink"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">
            {description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            {actions}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{note}</p>
        </div>
        {art}
      </Container>
    </section>
  )
}
