import { useTranslation } from "@workspace/i18n/react"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { type ReactNode, useId } from "react"

import { Section, SectionHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { CandidateArt, EmployerArt } from "./art/audience-art"

function AudienceCard({
  art,
  heading,
  points,
  href,
  linkLabel,
}: {
  art: ReactNode
  heading: string
  points: string[]
  href: string
  linkLabel: string
}) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="group/audience reveal flex flex-col gap-5 rounded-2xl border p-5 transition-colors duration-300 hover:border-brand/40 sm:p-6"
    >
      <div className="rounded-xl bg-muted/40 px-6 py-4">
        <div className="mx-auto max-w-72">{art}</div>
      </div>
      <h3 id={headingId} className="text-xl font-semibold tracking-tight">
        {heading}
      </h3>
      <ul className="flex flex-col gap-2.5 text-muted-foreground">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-muted text-brand-text">
              <CheckIcon aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <a
        href={href}
        className="more-link mt-auto inline-flex w-fit items-center gap-1.5 pt-1"
      >
        {linkLabel}
        <ArrowRightIcon
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover/audience:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover/audience:-translate-x-0.5"
        />
      </a>
    </section>
  )
}

export function Audiences() {
  const { t } = useTranslation("about")
  const titleId = useId()

  return (
    <Section aria-labelledby={titleId} className="border-t py-14 sm:py-20">
      <SectionHeader id={titleId} title={t("whatWeDo.title")} />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <AudienceCard
          art={<EmployerArt />}
          heading={t("whatWeDo.employersHeading")}
          points={t("whatWeDo.employerPoints", { returnObjects: true })}
          href={APP_LINKS.employerRegister}
          linkLabel={t("whatWeDo.employersLink")}
        />
        <AudienceCard
          art={<CandidateArt />}
          heading={t("whatWeDo.candidatesHeading")}
          points={t("whatWeDo.candidatePoints", { returnObjects: true })}
          href={APP_LINKS.candidateRegister}
          linkLabel={t("whatWeDo.candidatesLink")}
        />
      </div>
    </Section>
  )
}
