import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import * as m from "motion/react-m"
import { useEffect, useRef } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

const TIMELINE = [
  { key: "submitted", state: "done" },
  { key: "review", state: "current" },
  { key: "verified", state: "next" },
] as const

/** After submitting: where the review stands, and what to do meanwhile. */
export function Submitted({ email }: { email: string }) {
  const { t } = useTranslation("onboarding")
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <div className="grid items-start gap-12 py-4 lg:grid-cols-[minmax(0,1fr)_24rem] xl:gap-20">
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, ease }}
        className="flex flex-col items-start gap-6"
      >
        <svg viewBox="0 0 56 56" aria-hidden="true" className="size-14">
          <circle cx={28} cy={28} r={28} className="pop fill-success/12" />
          <circle
            cx={28}
            cy={28}
            r={20}
            pathLength={1}
            strokeWidth={2.5}
            className="draw fill-none stroke-success"
          />
          <path
            d="M19 28.5 L25.5 35 L37.5 22"
            pathLength={1}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="draw fill-none stroke-success [animation-delay:0.7s]"
          />
        </svg>
        <div className="flex flex-col gap-3">
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl"
          >
            {t("done.title")}
          </h1>
          <p className="max-w-lg text-base text-pretty text-muted-foreground">
            {t("done.lead")}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink
            to={href("/employer/jobs/new")}
            className={buttonLink({ size: "lg" })}
          >
            {t("done.postJob")}
          </AppLink>
          <AppLink
            to={href("/employer/dashboard")}
            className={buttonLink({ variant: "outline", size: "lg" })}
          >
            {t("done.dashboard")}
          </AppLink>
        </div>
      </m.div>

      <section
        aria-labelledby="next-steps"
        className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-[0_12px_32px_-12px_rgb(15_23_42/0.18)]"
      >
        <h2 id="next-steps" className="text-base font-semibold">
          {t("done.nextHeading")}
        </h2>
        <ol className="flex flex-col">
          {TIMELINE.map(({ key, state }, i) => (
            <m.li
              key={key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: duration.slow,
                ease,
                delay: 0.25 + i * 0.12,
              }}
              aria-current={state === "current" ? "step" : undefined}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {i < TIMELINE.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-s-[11px] top-7 bottom-1 w-px",
                    state === "done" ? "bg-success/50" : "bg-border"
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-6 shrink-0 place-items-center rounded-full border-2",
                  state === "done" && "border-success bg-success",
                  state === "current" && "border-brand bg-background",
                  state === "next" && "bg-background"
                )}
              >
                {state === "current" && (
                  <span className="size-2 animate-pulse rounded-full bg-brand motion-reduce:animate-none" />
                )}
                {state === "done" && (
                  <span className="size-2 rounded-full bg-background" />
                )}
              </span>
              <div className="flex min-w-0 flex-col gap-1 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    state === "next" && "text-muted-foreground"
                  )}
                >
                  {t(`done.timeline.${key}.title`)}
                </p>
                <p className="text-sm text-pretty text-muted-foreground">
                  {t(`done.timeline.${key}.body`, { email })}
                </p>
              </div>
            </m.li>
          ))}
        </ol>
      </section>
    </div>
  )
}
