import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useScroll, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { LockOpenIcon } from "lucide-react"
import { useId, useRef } from "react"

import { Container } from "@/components/section"

import { AudienceCtas } from "./audience-ctas"
import { Photo } from "./photo"
import { settled } from "./scene-context"
import { useStill } from "./use-still"

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()
  const still = useStill(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  })

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      className="overflow-x-clip border-t py-16 sm:py-28"
    >
      {/* transforms stay bound to the first value, so a switch remounts */}
      <Closing
        key={still ? "still" : "live"}
        titleId={titleId}
        progress={still ? settled : scrollYProgress}
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
  const { t } = useTranslation("homeV3")
  const zoom = useTransform(progress, [0, 1], [1.12, 1])
  const rise = useTransform(progress, [0.45, 0.8], ["2rem", "0rem"])
  const arrive = useTransform(progress, [0.45, 0.7], [0, 1])

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
      <div className="relative pb-10 sm:pb-12">
        <div className="overflow-hidden rounded-3xl border">
          <m.div style={{ scale: zoom }}>
            <Photo
              name="home-v3/her-break"
              alt={t("final.photo")}
              sizes="(min-width: 64rem) 36rem, 100vw"
              className="aspect-3/2"
            />
          </m.div>
        </div>
        <m.div
          style={{ opacity: arrive, y: rise }}
          className="absolute inset-s-4 bottom-0 flex max-w-sm items-start gap-3 rounded-2xl border bg-card p-4 sm:inset-s-6"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-muted text-brand-text">
            <LockOpenIcon aria-hidden className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="flex items-baseline justify-between gap-3 text-sm font-semibold">
              {t("final.notice.title")}
              <span className="text-xs font-normal text-muted-foreground">
                {t("final.notice.time")}
              </span>
            </p>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              {t("final.notice.body")}
            </p>
          </div>
        </m.div>
      </div>
    </Container>
  )
}
