import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { HeroScene } from "./art/hero-scene"
import { AudienceCtas } from "./audience-ctas"

export function Hero() {
  const { t } = useTranslation("home")

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="grid grid-cols-1 items-center gap-12 pt-10 pb-16 sm:pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pt-6 lg:pb-24">
        <div className="flex flex-col items-start lg:pb-20">
          <h1 id="hero-title" className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-brand-muted px-3 py-1 text-sm font-medium text-brand-text">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              {t("hero.eyebrow")}
            </span>
            <span className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {t("hero.title")}{" "}
              <span className="relative inline-block text-brand-text">
                {t("hero.accent")}
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute inset-x-0 -bottom-2 h-3 w-full text-brand"
                >
                  <path
                    pathLength={1}
                    d="M3 9C48 4 120 2 197 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="ink"
                  />
                </svg>
              </span>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl">
            {t("hero.description")}
          </p>

          <AudienceCtas className="mt-10" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t("hero.reassurance")}
          </p>
        </div>

        <HeroScene />
      </Container>
    </section>
  )
}
