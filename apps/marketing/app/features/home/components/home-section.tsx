import { cn } from "@workspace/ui/lib/utils"
import type { ReactNode } from "react"

import { Container } from "@/components/section"

/** The band is labelled by the heading with id `${id}-title`. */
export function HomeSection({
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
        "scroll-mt-20 overflow-x-clip py-12 sm:py-16 lg:py-20",
        muted && "bg-muted/40",
        flushTop && "pt-4 sm:pt-6 lg:pt-6"
      )}
    >
      <Container className={className}>{children}</Container>
    </section>
  )
}
