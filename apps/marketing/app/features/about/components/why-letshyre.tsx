import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"
import { usePagePath } from "@/hooks/use-page-path"

import { type ReasonId, WhyArt } from "./art/why-art"

const REASONS: { id: ReasonId; link?: "interview" | "pricing" }[] = [
  { id: "aiPowered", link: "interview" },
  { id: "faster" },
  { id: "network" },
  { id: "payPerUnlock", link: "pricing" },
  { id: "transparency" },
]

export function WhyLetsHyre() {
  const { t } = useTranslation("about")
  const pagePath = usePagePath()
  const headingId = useId()

  return (
    <Section aria-labelledby={headingId} className="border-t py-14 sm:py-20">
      <SectionHeader id={headingId} title={t("why.heading")} />
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {REASONS.map(({ id, link }, i) => (
          <li
            key={id}
            className={cn(
              "group/reason reveal flex flex-col gap-2 rounded-2xl border p-5 transition-colors duration-300 hover:border-brand/40 sm:p-6",
              i < 3 ? "lg:col-span-2" : "lg:col-span-3",
              i === 0 && "max-lg:sm:col-span-2"
            )}
          >
            <div className="mb-3">
              <WhyArt id={id} />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">
              {t(`why.cards.${id}.title`)}
            </h3>
            <p className="text-pretty text-muted-foreground">
              {t(`why.cards.${id}.desc`)}
            </p>
            {link && (
              <Link
                to={pagePath(link)}
                className="more-link mt-auto w-fit pt-2 text-sm"
              >
                {t(`why.links.${link}`)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}
