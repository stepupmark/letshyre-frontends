import { useTranslation } from "@workspace/i18n/react"
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckIcon,
  type LucideIcon,
  UserRoundIcon,
} from "lucide-react"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

function AudienceCard({
  icon: Icon,
  heading,
  points,
  href,
  linkLabel,
}: {
  icon: LucideIcon
  heading: string
  points: string[]
  href: string
  linkLabel: string
}) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-xl border p-5 sm:p-6"
    >
      <h3
        id={headingId}
        className="flex items-center gap-2 text-xl font-semibold tracking-tight"
      >
        <Icon aria-hidden className="size-5 text-brand" />
        {heading}
      </h3>
      <ul className="flex flex-col gap-2.5 text-muted-foreground">
        {points.map((point) => (
          <li key={point} className="flex gap-2.5">
            <CheckIcon
              aria-hidden
              className="mt-1 size-4 shrink-0 text-brand"
            />
            {point}
          </li>
        ))}
      </ul>
      <a
        href={href}
        className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-sm pt-2 text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {linkLabel}
        <ArrowRightIcon aria-hidden className="size-4 rtl:rotate-180" />
      </a>
    </section>
  )
}

export function Audiences() {
  const { t } = useTranslation("about")
  const titleId = useId()

  return (
    <Section aria-labelledby={titleId} className="border-t py-12 sm:py-16">
      <SectionHeader id={titleId} title={t("whatWeDo.title")} />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <AudienceCard
          icon={BriefcaseIcon}
          heading={t("whatWeDo.employersHeading")}
          points={t("whatWeDo.employerPoints", { returnObjects: true })}
          href={APP_LINKS.employerRegister}
          linkLabel={t("whatWeDo.employersLink")}
        />
        <AudienceCard
          icon={UserRoundIcon}
          heading={t("whatWeDo.candidatesHeading")}
          points={t("whatWeDo.candidatePoints", { returnObjects: true })}
          href={APP_LINKS.candidateRegister}
          linkLabel={t("whatWeDo.candidatesLink")}
        />
      </div>
    </Section>
  )
}
