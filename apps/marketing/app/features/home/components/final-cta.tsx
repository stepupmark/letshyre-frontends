import { useTranslation } from "@workspace/i18n/react"

import { Container } from "@/components/section"

import { AudienceCtas } from "./audience-ctas"

export function FinalCta() {
  const { t } = useTranslation("home")

  return (
    <section aria-labelledby="final-title" className="py-16 sm:py-24">
      <Container className="reveal flex flex-col items-center text-center">
        <h2 id="final-title" className="flex flex-col">
          <span className="font-display text-4xl leading-none tracking-tight text-balance sm:text-6xl">
            {t("final.title")}
          </span>
          <span className="font-script text-5xl leading-[1.2] text-brand-text sm:text-7xl">
            {t("final.accent")}
          </span>
        </h2>
        <p className="mt-5 max-w-md text-lg text-pretty text-muted-foreground">
          {t("final.description")}
        </p>
        <AudienceCtas className="mt-9 justify-center" />
      </Container>
    </section>
  )
}
