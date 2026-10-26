import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"
import { CtaLink } from "@/components/cta-links"

export function AudienceCtas({ className }: { className?: string }) {
  const { t } = useTranslation("home")

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CtaLink href={APP_LINKS.employerRegister}>
        {t("hero.ctaHiring")}
        <ArrowRightIcon aria-hidden />
      </CtaLink>
      <a
        href={APP_LINKS.candidateRegister}
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-12 border-foreground/20 px-6"
        )}
      >
        {t("hero.ctaCandidate")}
      </a>
    </div>
  )
}
