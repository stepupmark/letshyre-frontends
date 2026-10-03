import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useId } from "react"
import { Link } from "react-router"

import { Section, SectionHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

const ITEMS = ["interview", "evaluation", "matching", "hired"] as const

export function ForCandidates() {
  const { t } = useTranslation("home")
  const titleId = useId()
  const lang = useLocale()

  return (
    <Section
      id="for-candidates"
      aria-labelledby={titleId}
      className="scroll-mt-16 border-y bg-muted/40"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-8">
          <SectionHeader
            id={titleId}
            eyebrow={t("candidate.eyebrow")}
            title={t("candidate.title")}
            description={t("candidate.body")}
          />
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={APP_LINKS.candidateRegister}
              className={cn(
                buttonVariants({ size: "lg", className: "h-10 px-4" })
              )}
            >
              {t("hero.ctaJob")}
            </a>
            <Link
              to={localePath(lang, "/how-it-works-interview")}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-10 px-4",
                })
              )}
            >
              {t("candidate.guide")}
            </Link>
          </div>
        </div>
        <ul className="grid gap-8 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <li key={item} className="flex flex-col gap-2 border-t pt-5">
              <h3 className="text-lg font-semibold text-balance">
                {t(`candidate.items.${item}.title`)}
              </h3>
              <p className="text-pretty text-muted-foreground">
                {t(`candidate.items.${item}.desc`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
