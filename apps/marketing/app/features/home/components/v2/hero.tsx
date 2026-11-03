import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { AudienceCtas } from "../audience-ctas"
import { Callouts, ProductShot } from "./product-shot"
import { APPLICANT_MARKERS, APPLICANTS } from "./shots"

export function Hero() {
  const { t } = useTranslation(["home", "homeV2"])

  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip">
      <Container className="flex flex-col items-center pt-12 pb-16 text-center sm:pt-16 lg:pb-24">
        <p className="inline-flex items-center gap-2 rounded-full border bg-brand-muted px-3 py-1 text-sm font-medium text-brand-text">
          <span aria-hidden className="size-1.5 rounded-full bg-brand" />
          {t("home:hero.eyebrow")}
        </p>
        <h1
          id="hero-title"
          className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
        >
          {t("home:hero.title")}{" "}
          <span className="text-brand-text">{t("home:hero.accent")}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">
          {t("home:hero.description")}
        </p>
        <AudienceCtas className="mt-10 justify-center" />
        <p className="mt-4 text-sm text-muted-foreground">
          {t("home:hero.reassurance")}
        </p>

        <div className="mt-14 w-full max-w-5xl text-start sm:mt-20">
          <ProductShot
            shot={APPLICANTS}
            alt={t("homeV2:hero.alt")}
            sizes="(min-width: 1024px) 1024px, 100vw"
            markers={APPLICANT_MARKERS}
            priority
          />
          <Callouts
            items={t("homeV2:hero.callouts", { returnObjects: true })}
            className="mt-6"
          />
          <p className="mt-4 text-xs text-muted-foreground">
            {t("homeV2:sample")}
          </p>
        </div>
      </Container>
    </section>
  )
}
