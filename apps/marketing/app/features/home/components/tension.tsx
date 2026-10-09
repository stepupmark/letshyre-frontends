import { useTranslation } from "@workspace/i18n/react"

import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"
import { type Side, SideBySide } from "./side-by-side"

export function Tension() {
  const { t } = useTranslation("home")
  const sides = [
    t("tension.employer", { returnObjects: true }),
    t("tension.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <HomeSection
      id="tension"
      flushTop
      className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16"
    >
      <div className="reveal">
        <HomeHeading
          id="tension-title"
          eyebrow={t("tension.eyebrow")}
          title={t("tension.title")}
          accent={t("tension.accent")}
        />
        <SideBySide sides={sides} className="mt-8" />
      </div>

      <figure
        aria-hidden
        className="reveal relative mx-auto w-full max-w-md rotate-1 rounded-2xl border bg-card p-6 sm:p-8 lg:me-0"
      >
        <div className="flex flex-col gap-2">
          <span className="h-1.5 w-1/3 rounded-full bg-muted" />
          <span className="h-1.5 w-11/12 rounded-full bg-muted" />
          <span className="h-1.5 w-4/5 rounded-full bg-muted" />
        </div>
        <p className="mt-6 text-lg text-muted-foreground line-through decoration-brand decoration-2">
          {t("tension.claim")}
        </p>
        <p className="font-script mt-2 -rotate-2 text-4xl text-brand-text">
          {t("tension.correction")}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <span className="h-1.5 w-full rounded-full bg-muted" />
          <span className="h-1.5 w-2/3 rounded-full bg-muted" />
        </div>
      </figure>
    </HomeSection>
  )
}
