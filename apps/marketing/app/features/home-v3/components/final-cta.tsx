import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useScroll, useTransform } from "motion/react"
import * as m from "motion/react-m"
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
      className="relative isolate grid min-h-svh place-items-center overflow-hidden"
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
  const zoom = useTransform(progress, [0, 1], [1.2, 1])
  const scale = useTransform(progress, [0.3, 0.9], [0.9, 1])
  const opacity = useTransform(progress, [0.3, 0.7], [0, 1])

  return (
    <>
      <m.div style={{ scale: zoom }} className="absolute inset-0 -z-10">
        <Photo
          name="home-v3/handshake"
          alt={t("final.photo")}
          sizes="100vw"
          className="size-full"
        />
      </m.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-background/80" />
      <Container className="py-24">
        <m.div
          style={{ scale, opacity }}
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <h2
            id={titleId}
            className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
          >
            {t("final.title")}{" "}
            <span className="block text-brand-text">{t("final.accent")}</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-pretty">
            {t("final.description")}
          </p>
          <AudienceCtas className="mt-10 justify-center max-sm:w-full max-sm:flex-col max-sm:items-stretch" />
        </m.div>
      </Container>
    </>
  )
}
