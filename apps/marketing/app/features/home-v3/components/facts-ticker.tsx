import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react"
import * as m from "motion/react-m"
import { PauseIcon, PlayIcon } from "lucide-react"
import { useId, useRef, useState } from "react"

import { useStill } from "./use-still"

// % of one copy of the row per second, before scroll speeds it up
const DRIFT = 2.5

interface Fact {
  value: string
  label: string
}

export function FactsTicker() {
  const { t } = useTranslation("homeV3")
  const titleId = useId()
  const still = useStill(false)
  const facts = t("facts.items", { returnObjects: true })

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-x-clip border-y py-10 sm:py-14"
    >
      <h2 id={titleId} className="sr-only">
        {t("facts.label")}
      </h2>
      {still ? (
        <dl className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {facts.map((fact) => (
            <div key={fact.value}>
              <dt className="text-4xl font-semibold tracking-tight tabular-nums">
                {fact.value}
              </dt>
              <dd className="mt-2 text-pretty text-muted-foreground">
                {fact.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <Ticker facts={facts} />
      )}
    </section>
  )
}

function Ticker({ facts }: { facts: Fact[] }) {
  const { t } = useTranslation("homeV3")
  const [paused, setPaused] = useState(false)
  const offset = useMotionValue(0)
  const direction = useRef(1)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), {
    damping: 50,
    stiffness: 400,
  })
  const boost = useTransform(velocity, [0, 1000], [0, 5], { clamp: false })
  const x = useTransform(offset, (v) => `${(((v % 50) + 50) % 50) - 50}%`)

  useAnimationFrame((_, delta) => {
    if (paused) return
    const speed = boost.get()
    if (speed < 0) direction.current = -1
    else if (speed > 0) direction.current = 1
    const step = direction.current * DRIFT * (delta / 1000)
    offset.set(offset.get() - step * (1 + Math.abs(speed)))
  })

  return (
    <div className="relative">
      <dl className="sr-only">
        {facts.map((fact) => (
          <div key={fact.value}>
            <dt>{fact.value}</dt>
            <dd>{fact.label}</dd>
          </div>
        ))}
      </dl>
      <m.div aria-hidden style={{ x }} className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {facts.map((fact) => (
              <p
                key={fact.value}
                className="flex items-baseline gap-4 pe-16 sm:pe-24"
              >
                <span className="text-6xl font-semibold tracking-tight whitespace-nowrap tabular-nums sm:text-8xl">
                  {fact.value}
                </span>
                <span className="max-w-48 text-sm text-pretty text-muted-foreground sm:text-base">
                  {fact.label}
                </span>
              </p>
            ))}
          </div>
        ))}
      </m.div>
      <div className="mx-auto mt-6 flex max-w-6xl justify-end px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          size="icon"
          aria-label={paused ? t("facts.play") : t("facts.pause")}
          onClick={() => {
            setPaused(!paused)
          }}
          className="size-11"
        >
          {paused ? <PlayIcon aria-hidden /> : <PauseIcon aria-hidden />}
        </Button>
      </div>
    </div>
  )
}
