import { useTranslation } from "@workspace/i18n/react"

import { wait } from "@/components/art/delay"
import { Container } from "@/components/section"

import { AudienceCtas } from "../audience-ctas"
import { HeroScene } from "./scenes/hero-scene"

export function Hero() {
  const { t } = useTranslation("homeV2")

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="flex flex-col items-center pt-14 text-center sm:pt-20 lg:pt-24">
        <p className="lift inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          {t("hero.eyebrow")}
        </p>
        <h1
          id="hero-title"
          className="lift mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {t("hero.title")}{" "}
          <span className="text-brand-text">{t("hero.accent")}</span>
        </h1>
        <p
          className="lift mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl"
          style={wait(80)}
        >
          {t("hero.description")}
        </p>
        <div
          className="lift mt-10 flex flex-col items-center"
          style={wait(160)}
        >
          <AudienceCtas className="justify-center" />
          <p className="mt-4 text-sm text-muted-foreground">
            {t("hero.reassurance")}
          </p>
        </div>
      </Container>
      <Container className="mt-14 pb-16 sm:mt-20 sm:pb-24">
        <HeroScene />
      </Container>
    </section>
  )
}
