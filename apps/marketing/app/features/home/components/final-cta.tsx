import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useId } from "react"

import { Section, SectionHeader } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

export function FinalCta() {
  const { t } = useTranslation("home")
  const titleId = useId()

  return (
    <Section aria-labelledby={titleId} className="border-t bg-muted/40">
      <div className="flex flex-col items-start gap-8">
        <SectionHeader
          id={titleId}
          eyebrow={t("hireCard.title")}
          title={`${t("hero.tagline.stop")} ${t("hero.tagline.start")}`}
          description={t("hireCard.description")}
        />
        <div className="flex flex-wrap gap-3">
          <a
            href={APP_LINKS.employerRegister}
            className={cn(
              buttonVariants({ size: "lg", className: "h-10 px-4" })
            )}
          >
            {t("hireCard.startHiring")}
          </a>
          <a
            href={APP_LINKS.candidateRegister}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-10 px-4",
              })
            )}
          >
            {t("hireCard.applyJob")}
          </a>
        </div>
      </div>
    </Section>
  )
}
