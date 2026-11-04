import { useTranslation } from "@workspace/i18n/react"
import { useTransform } from "motion/react"
import * as m from "motion/react-m"
import { lazy, Suspense, useId } from "react"

import { useHydrated } from "@/hooks/use-hydrated"

import { AudienceCtas } from "./audience-ctas"
import { Photo } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"

// decorative, so it loads after hydration; a prerendered Suspense needs inline scripts the CSP blocks
const ClaimCloud = lazy(() => import("./claim-cloud"))

export function Hero() {
  const titleId = useId()

  return (
    <ScrollScene screens={2.2} aria-labelledby={titleId}>
      <div className="relative h-full">
        <HeroCopy titleId={titleId} />
        <HeroPhoto />
      </div>
    </ScrollScene>
  )
}

function HeroCopy({ titleId }: { titleId: string }) {
  const { t } = useTranslation("homeV3")
  const { progress, still } = useScene()
  const y = useTransform(progress, [0, 0.4], ["0%", "-12%"])
  const opacity = useTransform(progress, [0.05, 0.3], [1, 0])

  return (
    <m.div
      style={still ? undefined : { y, opacity }}
      className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-12 text-center sm:px-6 sm:pt-20 lg:px-8"
    >
      <p className="text-sm font-semibold text-brand-text">
        {t("hero.eyebrow")}
      </p>
      <h1
        id={titleId}
        className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl"
      >
        {t("hero.title")}{" "}
        <span className="block text-brand-text">{t("hero.accent")}</span>
      </h1>
      <p className="mt-5 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
        {t("hero.description")}
      </p>
      <AudienceCtas className="mt-8 justify-center max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
      <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
        {t("hero.reassurance")}
      </p>
    </m.div>
  )
}

function HeroPhoto() {
  const { t } = useTranslation("homeV3")
  const { progress, still } = useScene()
  const hydrated = useHydrated()
  const scale = useTransform(progress, [0, 0.75], [0.62, 1])
  const y = useTransform(progress, [0, 0.75], ["62svh", "0svh"])
  const zoom = useTransform(progress, [0, 1], [1.2, 1])

  if (still) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <Photo
          name="home-v3/hiring-lead"
          alt={t("hero.photo")}
          sizes="(min-width: 72rem) 72rem, 100vw"
          priority
          className="aspect-3/2 rounded-2xl border"
        />
      </div>
    )
  }

  return (
    <>
      <m.div
        style={{ scale, y }}
        className="absolute inset-0 origin-top overflow-hidden rounded-3xl"
      >
        <m.div style={{ scale: zoom }} className="size-full">
          <Photo
            name="home-v3/hiring-lead"
            alt={t("hero.photo")}
            sizes="100vw"
            priority
            className="size-full"
          />
        </m.div>
      </m.div>
      {hydrated ? (
        <Suspense>
          <ClaimCloud />
        </Suspense>
      ) : null}
    </>
  )
}
