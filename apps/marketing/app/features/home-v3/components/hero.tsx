import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { AudienceCtas } from "./audience-ctas"

export function Hero() {
  const { t } = useTranslation("homeV3")

  return (
    <section aria-labelledby="hero-title">
      <Container className="flex min-h-svh flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold text-brand-text">
          {t("hero.eyebrow")}
        </p>
        <h1
          id="hero-title"
          className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {t("hero.title")}{" "}
          <span className="block text-brand-text">{t("hero.accent")}</span>
        </h1>
        <p className="mt-6 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
          {t("hero.description")}
        </p>
        <AudienceCtas className="mt-10 justify-center max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
      </Container>
    </section>
  )
}
