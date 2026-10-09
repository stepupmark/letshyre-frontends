import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { ArrowRightIcon } from "lucide-react"

import { APP_LINKS } from "@/lib/app-links"

export function AudienceCtas({ className }: { className?: string }) {
  const { t } = useTranslation("home")

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={APP_LINKS.employerRegister}
        className={cn(buttonVariants({ size: "lg" }), "h-12 px-6")}
      >
        {t("hero.ctaHiring")}
        <ArrowRightIcon aria-hidden />
      </a>
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
