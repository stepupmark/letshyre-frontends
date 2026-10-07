import { buttonVariants } from "@workspace/ui/components/button"
import { useId } from "react"
import { Link } from "react-router"

import { APP_LINKS } from "@/lib/app-links"

import { Section, SectionHeader } from "./section"

const primary = buttonVariants({ size: "lg", className: "h-10 px-4" })
const outline = buttonVariants({
  variant: "outline",
  size: "lg",
  className: "h-10 px-4",
})

/** Employer sign-up plus one secondary action: an app link (`href`) or a page on this site (`to`). */
export function CtaBand({
  eyebrow,
  title,
  description,
  hireLabel,
  secondary,
}: {
  eyebrow?: string
  title: string
  description: string
  hireLabel: string
  secondary: { label: string; href: string } | { label: string; to: string }
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
          <a href={APP_LINKS.employerRegister} className={primary}>
            {hireLabel}
          </a>
          {"to" in secondary ? (
            <Link to={secondary.to} className={outline}>
              {secondary.label}
            </Link>
          ) : (
            <a href={secondary.href} className={outline}>
              {secondary.label}
            </a>
          )}
        </div>
      </div>
    </Section>
  )
}
