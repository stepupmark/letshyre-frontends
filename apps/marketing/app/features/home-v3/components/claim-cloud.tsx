import { useTranslation } from "@workspace/i18n/react"
import { type MotionValue, useTransform } from "motion/react"
import * as m from "motion/react-m"

import { useScene } from "./scene-context"

// in the margins either side of the unscaled photo, in % of the stage, and how fast each leaves
const SPOTS = [
  { side: "start", inset: 3, y: 60, speed: 1.4 },
  { side: "end", inset: 4, y: 56, speed: 1 },
  { side: "start", inset: 7, y: 76, speed: 1.8 },
  { side: "end", inset: 2, y: 72, speed: 1.2 },
  { side: "start", inset: 2, y: 90, speed: 1.6 },
  { side: "end", inset: 6, y: 88, speed: 1.1 },
] as const

export default function ClaimCloud() {
  const { t } = useTranslation("homeV3")
  const { progress } = useScene()
  const claims = t("hero.claims", { returnObjects: true })

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 max-sm:hidden"
    >
      {SPOTS.map((spot, i) =>
        claims[i] ? (
          <Claim
            key={claims[i]}
            text={claims[i]}
            spot={spot}
            progress={progress}
          />
        ) : null
      )}
    </div>
  )
}

function Claim({
  text,
  spot,
  progress,
}: {
  text: string
  spot: (typeof SPOTS)[number]
  progress: MotionValue<number>
}) {
  const y = useTransform(progress, [0, 0.5], ["0vh", `${-40 * spot.speed}vh`])
  const opacity = useTransform(progress, [0, 0.15, 0.4], [1, 1, 0])
  const rotate = useTransform(
    progress,
    [0, 0.5],
    [0, (spot.side === "end" ? 6 : -6) * spot.speed]
  )

  return (
    <m.span
      style={{
        y,
        opacity,
        rotate,
        [spot.side === "end" ? "insetInlineEnd" : "insetInlineStart"]:
          `${spot.inset}%`,
        top: `${spot.y}%`,
      }}
      className="absolute rounded-lg border bg-card px-3 py-2 text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/60"
    >
      {text}
    </m.span>
  )
}
