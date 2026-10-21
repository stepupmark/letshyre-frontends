import { useTranslation } from "@workspace/i18n/react"
import { lazy, Suspense } from "react"

import { BandHeading } from "@/components/band-heading"
import { Band } from "@/components/band"
import { useHydrated } from "@/hooks/use-hydrated"

import { type Side, SideBySide } from "./side-by-side"

// decorative, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const ScreeningGrind = lazy(() => import("./art/screening-grind"))

export function Tension() {
  const { t } = useTranslation("home")
  const hydrated = useHydrated()
  const sides = [
    t("tension.employer", { returnObjects: true }),
    t("tension.candidate", { returnObjects: true }),
  ] as Side[]

  return (
    <Band
      id="tension"
      muted
      className="grid gap-12 md:grid-cols-2 md:items-center lg:gap-20"
    >
      <div className="slide-in">
        <BandHeading
          id="tension-title"
          eyebrow={t("tension.eyebrow")}
          title={t("tension.title")}
          accent={t("tension.accent")}
        />
        <SideBySide sides={sides} className="mt-10" />
      </div>

      <div className="min-h-136">
        {hydrated && (
          <Suspense>
            <ScreeningGrind />
          </Suspense>
        )}
      </div>
    </Band>
  )
}
