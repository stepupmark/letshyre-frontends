import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { AudienceCtas } from "./audience-ctas"
import { CandidateFile } from "./candidate-file"

export function Hero() {
  const { t } = useTranslation("home")

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="grid items-center gap-16 pt-6 pb-14 sm:pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pt-16 lg:pb-20">
        <div className="flex flex-col items-start">
          <h1 id="hero-title" className="flex flex-col">
            <span className="mb-6 text-sm font-medium tracking-wide text-brand-text">
              {t("hero.eyebrow")}
            </span>
            <span className="font-display text-5xl leading-[0.95] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {t("hero.title")}
            </span>
            <span className="font-script -mt-1 text-6xl leading-[1.15] text-brand-text sm:text-7xl lg:text-8xl">
              {t("hero.accent")}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-pretty text-muted-foreground">
            {t("hero.description")}
          </p>

          <AudienceCtas className="mt-9" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t("hero.reassurance")}
          </p>
        </div>

        <CandidateFile />
      </Container>
    </section>
  )
}
