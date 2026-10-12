import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { useEffect, useRef } from "react"

import { Tick } from "@/components/art/svg"

/** A sealed envelope leaving along a dotted trail. */
function SentArt() {
  return (
    <svg
      viewBox="0 0 200 96"
      aria-hidden="true"
      className="w-44 overflow-visible"
    >
      <path
        d="M8 84 C48 84 56 48 92 48"
        pathLength={1}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="0.02 0.04"
        className="fill-none stroke-brand/40"
      />
      <g className="rise">
        <rect
          x={92}
          y={16}
          width={96}
          height={64}
          rx={10}
          className="fill-card stroke-border drop-shadow-[0_12px_24px_rgb(15_23_42/0.1)]"
        />
        <path
          d="M94 20 L140 54 L186 20"
          strokeWidth={2}
          strokeLinejoin="round"
          className="fill-none stroke-border"
        />
      </g>
      <Tick cx={182} cy={20} r={13} delay={300} />
    </svg>
  )
}

export function ContactSuccess({
  email,
  onReset,
}: {
  email: string
  onReset: () => void
}) {
  const { t } = useTranslation("contact")
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <div className="flex min-h-120 flex-col items-start justify-center gap-5 px-5 py-10 sm:px-8">
      <SentArt />
      <div className="flex flex-col gap-1.5">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold tracking-tight outline-none"
        >
          {t("form.successTitle")}
        </h2>
        <p className="max-w-md text-pretty text-muted-foreground">
          {t("form.successBody")} {t("form.successNext", { email })}
        </p>
      </div>
      <Button variant="outline" onClick={onReset}>
        {t("form.sendAnother")}
      </Button>
    </div>
  )
}
