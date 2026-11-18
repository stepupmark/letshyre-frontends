import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useScroll, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { useId, useRef } from "react"

import { Container } from "@/components/section"
import { useHydrated } from "@/hooks/use-hydrated"

import { AudienceCtas } from "./audience-ctas"
import { Photo } from "./photo"
import { settled } from "./scene-context"
import { useStill } from "./use-still"

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()
  const hydrated = useHydrated()
  const still = useStill(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  })

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      data-watch="final"
      className="overflow-x-clip border-t py-12 sm:py-20 lg:py-24"
    >
      {/* settled until hydration so the prerender shows everything; a switch remounts the transforms */}
      <Closing
        key={hydrated && !still ? "live" : "still"}
        titleId={titleId}
        progress={hydrated && !still ? scrollYProgress : settled}
      />
    </section>
  )
}

function Closing({
  titleId,
  progress,
}: {
  titleId: string
  progress: MotionValue<number>
}) {
  const { t } = useTranslation("home")
  const zoom = useTransform(progress, [0, 1], [1.12, 1])

  return (
    <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="max-lg:text-center">
        <h2
          id={titleId}
          className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          {t("final.title")}{" "}
          <span className="block text-brand-text">{t("final.accent")}</span>
        </h2>
        <p className="mt-5 max-w-xl text-lg text-pretty max-lg:mx-auto">
          {t("final.description")}
        </p>
        <AudienceCtas className="mt-10 max-lg:justify-center max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
      </div>
      <div className="overflow-hidden rounded-3xl border">
        <m.div style={{ scale: zoom }}>
          <Photo
            name="home/her-break"
            alt={t("final.photo")}
            sizes="(min-width: 64rem) 36rem, 100vw"
            className="aspect-video"
          />
        </m.div>
      </div>
    </Container>
  )
}
