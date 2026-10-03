import { useTranslation } from "@workspace/i18n/react"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Container } from "@/components/section"
import { APP_LINKS } from "@/lib/app-links"

import { plainText } from "@/lib/plain-text"
import { ArrowRightIcon } from "lucide-react"
import { ScorecardPreview } from "./scorecard-preview"

export function Hero() {
  const { t } = useTranslation("home")

  return (
    <section aria-labelledby="hero-title" className="border-b">
      <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <h1
            id="hero-title"
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {plainText(t("hero.title"))}
          </h1>
          <p className="max-w-xl text-lg text-pretty text-muted-foreground">
            {t("hero.description")}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={APP_LINKS.employerRegister}
              className={cn(
                buttonVariants({ size: "lg", className: "h-10 px-4" })
              )}
            >
              {t("hero.ctaHiring")}
            </a>
            <a
              href={APP_LINKS.candidateRegister}
              className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {t("hero.ctaJob")}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </a>
          </div>
        </div>
        <ScorecardPreview />
      </Container>
    </section>
  )
}
