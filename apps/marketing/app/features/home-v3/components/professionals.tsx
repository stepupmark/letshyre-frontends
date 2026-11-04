import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useScroll, useTransform } from "motion/react"
import * as m from "motion/react-m"
import { ArrowRightIcon } from "lucide-react"
import { useId, useRef } from "react"

import { APP_LINKS } from "@/lib/app-links"
import { PAGES } from "@/lib/pages"
import { CtaLink, TextLink } from "@/components/cta-links"
import { Container } from "@/components/section"

import { Photo } from "./photo"
import { settled } from "./scene-context"
import { useStill } from "./use-still"

export function Professionals() {
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()
  const still = useStill(true)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  })

  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      className="overflow-x-clip border-y bg-muted/40 py-16 sm:py-28"
    >
      {/* transforms stay bound to the first value, so a switch remounts */}
      <Split
        key={still ? "still" : "live"}
        titleId={titleId}
        progress={still ? settled : scrollYProgress}
      />
    </section>
  )
}

function Split({
  titleId,
  progress,
}: {
  titleId: string
  progress: MotionValue<number>
}) {
  const { t } = useTranslation("homeV3")
  const lang = useLocale()
  const photoX = useTransform(progress, [0, 0.8], ["-14%", "0%"])
  const copyX = useTransform(progress, [0, 0.8], ["14%", "0%"])
  const opacity = useTransform(progress, [0, 0.5], [0, 1])
  const pool = useTransform(progress, [0.75, 1], [0, 1])

  return (
    <Container className="grid items-center gap-12 md:grid-cols-2 lg:gap-20">
      <m.div style={{ x: photoX, opacity }}>
        <Photo
          name="home-v3/professional"
          alt={t("professionals.photo")}
          sizes="(min-width: 48rem) 36rem, 100vw"
          className="aspect-3/2 rounded-3xl border md:aspect-4/5"
        />
      </m.div>
      <m.div style={{ x: copyX, opacity }}>
        <p className="text-sm font-semibold text-brand-text">
          {t("professionals.eyebrow")}
        </p>
        <h2
          id={titleId}
          className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl"
        >
          {t("professionals.title")}{" "}
          <span className="block text-brand-text">
            {t("professionals.accent")}
          </span>
        </h2>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground sm:text-lg">
          {t("professionals.body")}
        </p>
        <ol className="mt-8 grid gap-2">
          {t("professionals.interviews", { returnObjects: true }).map(
            (slot, i) => (
              <Slot key={slot.label} index={i} progress={progress} {...slot} />
            )
          )}
        </ol>
        <div className="mt-6 max-w-md">
          <p className="flex justify-between text-sm">
            <span className="font-semibold tabular-nums">
              {t("professionals.days")}
            </span>
            <span className="text-muted-foreground">
              {t("professionals.daysLabel")}
            </span>
          </p>
          <span
            aria-hidden
            className="mt-2 block h-1.5 overflow-hidden rounded-full bg-background"
          >
            <m.span
              style={{ scaleX: pool }}
              className="block h-full rounded-full bg-brand ltr:origin-left rtl:origin-right"
            />
          </span>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <CtaLink href={APP_LINKS.candidateRegister}>
            {t("professionals.cta")}
            <ArrowRightIcon aria-hidden className="rtl:-scale-x-100" />
          </CtaLink>
          <TextLink to={localePath(lang, PAGES.download.path)}>
            {t("professionals.download")}
          </TextLink>
        </div>
      </m.div>
    </Container>
  )
}

function Slot({
  index,
  label,
  role,
  progress,
}: {
  index: number
  label: string
  role: string
  progress: MotionValue<number>
}) {
  const start = 0.45 + index * 0.1
  const fill = useTransform(progress, [start, start + 0.1], [0, 1])

  return (
    <li className="flex max-w-md items-center gap-3 rounded-xl border bg-background px-4 py-3">
      <span
        aria-hidden
        className="grid size-6 shrink-0 place-items-center rounded-full border"
      >
        <m.span
          style={{ opacity: fill, scale: fill }}
          className="size-3 rounded-full bg-brand"
        />
      </span>
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-sm text-muted-foreground">{role}</span>
    </li>
  )
}
