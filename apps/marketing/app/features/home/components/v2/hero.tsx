import { useTranslation } from "@workspace/i18n/react"

import { wait } from "@/components/art/delay"
import { Container } from "@/components/section"

import { AudienceCtas } from "../audience-ctas"
import { HeroScene } from "./scenes/hero-scene"

export function Hero() {
  const { t } = useTranslation("homeV2")

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="flex flex-col items-center pt-10 text-center sm:pt-20 lg:pt-24">
        <p className="lift inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:text-sm">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          {t("hero.eyebrow")}
        </p>
        <h1
          id="hero-title"
          className="lift mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:mt-6 sm:text-5xl lg:text-6xl xl:text-7xl"
        >
          {t("hero.title")}{" "}
          <span className="block text-brand-text">{t("hero.accent")}</span>
        </h1>
        <p
          className="lift mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:mt-6 sm:text-lg lg:text-xl"
          style={wait(80)}
        >
          {t("hero.description")}
        </p>
        <div
          className="lift mt-8 flex w-full flex-col items-center sm:mt-10"
          style={wait(160)}
        >
          <AudienceCtas className="justify-center max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
          <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
            {t("hero.reassurance")}
          </p>
        </div>
      </Container>
      <Container className="mt-12 pb-16 sm:mt-20 sm:pb-24">
        <HeroScene />
      </Container>
    </section>
  )
}
