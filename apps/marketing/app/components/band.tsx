import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

import { Container } from "@/components/section"

/** The band is labelled by the heading with id `${id}-title`. */
export function Band({
  id,
  muted,
  flushTop,
  className,
  children,
}: {
  id: string
  muted?: boolean
  flushTop?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "overflow-x-clip py-16 sm:py-24",
        muted && "border-y bg-muted/40",
        flushTop && "pt-0 sm:pt-0"
      )}
    >
      <Container className={className}>{children}</Container>
    </section>
  )
}
