import { useTranslation } from "@workspace/i18n/react"
import { clamp, type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useEffect, useId, useRef } from "react"

import { AudienceCtas } from "./audience-ctas"
import { HeroResume } from "./hero-resume"
import { Photo } from "./photo"
import { useScene } from "./scene-context"
import { ScrollScene } from "./scroll-scene"

// the photo shrinks into the resume's 4:5 photo slot: 4rem wide, inset by the card's 1.25rem padding
const THUMB = 64
const INSET = 20

export function Hero() {
  const titleId = useId()
  const { t } = useTranslation("homeV3")

  return (
    <ScrollScene screens={1.6} pinFrom="lg" aria-labelledby={titleId}>
      <div className="mx-auto grid size-full max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pt-16 lg:pb-0">
        <div className="max-lg:text-center">
          <p className="text-sm font-semibold text-brand-text">
            {t("hero.eyebrow")}
          </p>
          <h1
            id={titleId}
            className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-6xl xl:text-7xl"
          >
            {t("hero.title")}{" "}
            <span className="block text-brand-text">{t("hero.accent")}</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-pretty text-muted-foreground max-lg:mx-auto sm:text-lg">
            {t("hero.description")}
          </p>
          <AudienceCtas className="mt-8 max-lg:justify-center max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
          <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
            {t("hero.reassurance")}
          </p>
          <a
            href="#pricing"
            className="sr-only rounded-sm text-sm font-medium underline-offset-4 outline-none focus-visible:not-sr-only focus-visible:mt-4 focus-visible:inline-block focus-visible:underline focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t("hero.skip")}
          </a>
        </div>
        <HeroStage />
      </div>
    </ScrollScene>
  )
}

function HeroStage() {
  const { t } = useTranslation("homeV3")
  const { progress, still } = useScene()

  if (still) {
    return (
      <div className="mx-auto grid w-full max-w-sm gap-4">
        <Photo
          name="home-v3/candidate"
          alt={t("hero.photo")}
          sizes="24rem"
          portrait
          priority
          className="aspect-4/5 rounded-3xl border"
        />
        <HeroResume progress={progress} />
      </div>
    )
  }

  return <LiveStage progress={progress} />
}

function LiveStage({ progress }: { progress: MotionValue<number> }) {
  const { t } = useTranslation("homeV3")
  const stage = useRef<HTMLDivElement>(null)
  const ratio = useRef(0.15)

  // the target scale depends on the rendered width, which the breakpoints change
  useEffect(() => {
    const node = stage.current
    if (!node) return
    const measure = () => {
      ratio.current = THUMB / node.offsetWidth
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  const shrink = (p: number) => clamp(0, 1, (p - 0.12) / 0.4)
  const scale = useTransform(
    progress,
    (p) => 1 - shrink(p) * (1 - ratio.current)
  )
  const x = useTransform(progress, (p) => shrink(p) * INSET)
  const y = useTransform(progress, (p) => shrink(p) * INSET)

  return (
    <div
      ref={stage}
      className="relative mx-auto aspect-4/5 w-full max-w-sm lg:max-w-md"
    >
      <HeroResume progress={progress} slot />
      <m.div
        style={{ scale, x, y }}
        className="absolute inset-x-0 top-0 aspect-4/5 overflow-hidden rounded-3xl border ltr:origin-top-left rtl:origin-top-right"
      >
        <Photo
          name="home-v3/candidate"
          alt={t("hero.photo")}
          sizes="(min-width: 64rem) 28rem, 24rem"
          portrait
          priority
          className="size-full"
        />
      </m.div>
    </div>
  )
}
