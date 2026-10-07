import { buttonVariants } from "@workspace/ui/components/button"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "./section"

/** An app link (`href`) or a page on this site (`to`). */
export type CtaAction = { label: string } & ({ href: string } | { to: string })

const primaryClass = buttonVariants({ size: "lg", className: "h-10 px-4" })
const outlineClass = buttonVariants({
  variant: "outline",
  size: "lg",
  className: "h-10 px-4",
})

function ActionLink({
  action,
  className,
}: {
  action: CtaAction
  className: string
}) {
  return "to" in action ? (
    <Link to={action.to} className={className}>
      {action.label}
    </Link>
  ) : (
    <a href={action.href} className={className}>
      {action.label}
    </a>
  )
}

export function CtaBand({
  eyebrow,
  title,
  description,
  primary,
  secondary,
}: {
  eyebrow?: string
  title: string
  description: string
  primary: CtaAction
  secondary: CtaAction
}) {
  const titleId = useId()

  return (
    <Section
      aria-labelledby={titleId}
      className="border-t bg-muted/40 py-12 sm:py-16"
    >
      <div className="flex flex-col items-start gap-6">
        <SectionHeader
          id={titleId}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <div className="flex flex-wrap gap-3">
          <ActionLink action={primary} className={primaryClass} />
          <ActionLink action={secondary} className={outlineClass} />
        </div>
      </div>
    </Section>
  )
}
