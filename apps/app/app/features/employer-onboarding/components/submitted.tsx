import { useTranslation } from "@workspace/i18n/react"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "@tanstack/react-query"
import * as m from "motion/react-m"
import { Check } from "lucide-react"
import { useEffect, useRef } from "react"
import { href } from "react-router"

import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import { kycStatusQuery } from "../queries/kyc-status.queries"
import type { ReviewState } from "../schemas/kyc-status.schema"

type Mark = "done" | "current" | "attention" | "next"

const TIMELINE: Record<
  ReviewState,
  { key: "submitted" | "review" | "rejected" | "verified"; mark: Mark }[]
> = {
  pending: [
    { key: "submitted", mark: "done" },
    { key: "review", mark: "current" },
    { key: "verified", mark: "next" },
  ],
  rejected: [
    { key: "submitted", mark: "done" },
    { key: "rejected", mark: "attention" },
    { key: "verified", mark: "next" },
  ],
  verified: [
    { key: "submitted", mark: "done" },
    { key: "review", mark: "done" },
    { key: "verified", mark: "done" },
  ],
}

/** After submitting: where the review stands, and what to do meanwhile. */
export function Submitted({ email }: { email: string }) {
  const { t } = useTranslation("onboarding")
  const heading = useRef<HTMLHeadingElement>(null)
  const status = useQuery(kycStatusQuery())
  const steps = TIMELINE[status.data ?? "pending"]

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <div className="grid items-start gap-12 py-4 lg:min-h-[60svh] lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center xl:gap-20">
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.slow, ease }}
        className="flex flex-col items-start gap-6"
      >
        <svg viewBox="0 0 56 56" aria-hidden="true" className="size-16">
          <circle cx={28} cy={28} r={28} className="pop fill-success/10" />
          <circle cx={28} cy={28} r={24} className="pop fill-success/12" />
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
        className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_12px_32px_-12px_rgb(15_23_42/0.18)]"
      >
        <h2
          id="next-steps"
          className="border-b bg-muted/30 px-6 py-4 text-base font-semibold"
        >
          {t("done.nextHeading")}
        </h2>
        <ol className="flex flex-col p-6">
          {steps.map(({ key, mark }, i) => (
            <m.li
              key={key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: duration.slow,
                ease,
                delay: 0.25 + i * 0.12,
              }}
              aria-current={
                mark === "current" || mark === "attention" ? "step" : undefined
              }
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-s-[11px] top-7 bottom-1 w-px",
                    mark === "done" ? "bg-success/50" : "bg-border"
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  "relative grid size-6 shrink-0 place-items-center rounded-full border-2",
                  mark === "done" && "border-success bg-success",
                  mark === "current" && "border-brand bg-background",
                  mark === "attention" && "border-danger bg-background",
                  mark === "next" && "bg-background"
                )}
              >
                {mark === "attention" && (
                  <span className="size-2 rounded-full bg-danger" />
                )}
                {mark === "current" && (
                  <span className="size-2 animate-pulse rounded-full bg-brand motion-reduce:animate-none" />
                )}
                {mark === "done" && (
                  <Check className="size-3.5 text-background" strokeWidth={3} />
                )}
              </span>
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-col gap-1 pt-0.5",
                  (mark === "current" || mark === "attention") &&
                    "-mt-2 rounded-xl px-3 py-2.5",
                  mark === "current" && "bg-brand-muted/50",
                  mark === "attention" && "bg-danger/5"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    mark === "next" && "text-muted-foreground"
                  )}
                >
                  {t(`done.timeline.${key}.title`)}
                </p>
                <p
                  className={cn(
                    "text-sm text-pretty",
                    mark === "current"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <WithEmail
                    text={t(`done.timeline.${key}.body`, { email })}
                    email={email}
                  />
                </p>
                {mark === "attention" && (
                  <AppLink
                    to={href("/employer/company")}
                    className="w-fit text-sm font-medium text-brand-text underline underline-offset-4"
                  >
                    {t("done.fixDetails")}
                  </AppLink>
                )}
              </div>
            </m.li>
          ))}
        </ol>
      </section>
    </div>
  )
}

/** Picks the address out of a translated sentence so it reads as one unit. */
function WithEmail({ text, email }: { text: string; email: string }) {
  const at = email ? text.indexOf(email) : -1
  if (at === -1) return text
  return (
    <>
      {text.slice(0, at)}
      <span className="font-medium break-all text-foreground">{email}</span>
      {text.slice(at + email.length)}
    </>
  )
}
