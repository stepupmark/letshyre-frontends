import { buttonVariants } from "@workspace/ui/components/button"
import { useId } from "react"

import { APP_LINKS } from "@/lib/app-links"

import { Section, SectionHeader } from "./section"

export function CtaBand({
  eyebrow,
  title,
  description,
  hireLabel,
  joinLabel,
}: {
  eyebrow?: string
  title: string
  description: string
  hireLabel: string
  joinLabel: string
}) {
  const titleId = useId()

  return (
    <Section aria-labelledby={titleId} className="border-t bg-muted/40">
      <div className="flex flex-col items-start gap-8">
        <SectionHeader
          id={titleId}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="flex flex-wrap gap-3">
          <a
            href={APP_LINKS.employerRegister}
            className={buttonVariants({ size: "lg", className: "h-10 px-4" })}
          >
            {hireLabel}
          </a>
          <a
            href={APP_LINKS.candidateRegister}
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "h-10 px-4",
            })}
          >
            {joinLabel}
          </a>
        </div>
      </div>
    </Section>
  )
}
