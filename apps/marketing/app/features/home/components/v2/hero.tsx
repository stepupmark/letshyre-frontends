import { useTranslation } from "@workspace/i18n/react"

import { wait } from "@/components/art/delay"
import { Container } from "@/components/section"

import { AudienceCtas } from "../audience-ctas"
import { HeroScene } from "./scenes/hero-scene"

export function Hero() {
  const { t } = useTranslation("homeV2")

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="grid items-center gap-12 pt-12 pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:pt-20 lg:pb-32">
        <div className="lift">
          <p className="text-sm font-semibold text-brand-text">
            {t("hero.eyebrow")}
          </p>
          <h1
            id="hero-title"
            className="mt-4 text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-5xl xl:text-6xl"
          >
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
          </h1>
          <p className="mt-8 max-w-xl text-lg text-pretty text-muted-foreground">
            {t("hero.description")}
          </p>
          <div className="lift" style={wait(120)}>
            <AudienceCtas className="mt-10" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("hero.reassurance")}
            </p>
          </div>
        </div>
        <HeroScene />
      </Container>
    </section>
  )
}
