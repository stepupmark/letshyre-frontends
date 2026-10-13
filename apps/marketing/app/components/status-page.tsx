import { type ReactNode, useEffect, useRef } from "react"

import { Container } from "@/components/section"

interface StatusPageProps {
  label: string
  title: string
  body: string
  actions: ReactNode
  footer?: ReactNode
  art: ReactNode
}

/** Shared frame for the 404 and error pages. */
export function StatusPage({
  label,
  title,
  body,
  actions,
  footer,
  art,
}: StatusPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <Container className="grid items-center gap-10 py-12 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
      <div className="flex min-w-0 flex-col items-start gap-5">
        <p className="rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium text-muted-foreground">
          {label}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-4xl/[1.1] font-semibold tracking-tight text-balance outline-none sm:text-5xl/[1.05]"
        >
          {title}
        </h1>
        <p className="max-w-lg text-lg/[1.55] text-pretty text-muted-foreground">
          {body}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">{actions}</div>
        {footer}
      </div>
      {art}
    </Container>
  )
}
