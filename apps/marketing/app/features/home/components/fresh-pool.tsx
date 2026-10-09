import { useTranslation } from "@workspace/i18n/react"

import { HomeHeading } from "./home-heading"
import { HomeSection } from "./home-section"
import { type Side, SideBySide } from "./side-by-side"

export function FreshPool() {
  const { t } = useTranslation("home")
  const sides = [
    t("fresh.employer", { returnObjects: true }),
    t("fresh.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <HomeSection
      id="fresh"
      className="grid gap-10 md:grid-cols-2 md:items-center lg:gap-16"
    >
      <div aria-hidden className="reveal flex flex-col items-center">
        <p className="flex items-baseline gap-3">
          <span className="font-display text-[8rem] leading-none tracking-tighter sm:text-[11rem] lg:text-[12rem]">
            90
          </span>
          <span className="font-script text-5xl text-brand-text">
            {t("fresh.days")}
          </span>
        </p>
        <div className="mt-6 flex w-full max-w-sm items-center gap-3 text-xs text-muted-foreground">
          <span>{t("fresh.start")}</span>
          <span className="relative h-px flex-1 bg-border">
            <span className="absolute inset-s-[30%] -top-1 size-2.5 rounded-full bg-brand" />
            <span className="absolute inset-s-[55%] -top-1 size-2.5 rounded-full bg-brand" />
            <span className="absolute inset-s-[80%] -top-1 size-2.5 rounded-full border-2 border-brand bg-background" />
          </span>
          <span>{t("fresh.end")}</span>
        </div>
      </div>

      <div className="reveal">
        <HomeHeading
          id="fresh-title"
          eyebrow={t("fresh.eyebrow")}
          title={t("fresh.title")}
          accent={t("fresh.accent")}
        />
        <SideBySide sides={sides} className="mt-8" />
      </div>
    </HomeSection>
  )
}
