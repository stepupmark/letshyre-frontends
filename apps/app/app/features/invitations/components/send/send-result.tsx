import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Check, CircleAlert, RotateCcw } from "lucide-react"
import * as m from "motion/react-m"
import { useEffect, useId, useRef, type ReactNode } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { StatusBadge } from "@/components/status-badge"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import type { Recipient } from "../../lib/recipients"
import { EnvelopeArt } from "../art/envelope-art"
import { Monogram } from "../shared/monogram"

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.base, ease, delay },
})

export function SendResult({
  sent,
  queued,
  missed,
  role,
  templateName,
  sentAt,
  onAgain,
  onRetry,
}: {
  sent: Recipient[]
  queued: string[]
  missed: Recipient[]
  role: string
  templateName: string
  sentAt: Date
  onAgain: () => void
  onRetry: (missed: Recipient[]) => void
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  const heading = useRef<HTMLHeadingElement>(null)
  const names = new Map(sent.map((r) => [r.email.toLowerCase(), r.name]))
  const people = queued.map((email) => ({
    email,
    name: names.get(email.toLowerCase()) ?? "",
  }))

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease }}
          className="shrink-0"
        >
          <EnvelopeArt />
        </m.div>
        <div className="min-w-0">
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-balance outline-none"
          >
            {queued.length > 0 ? (
              <>
                <AnimatedNumber
                  value={queued.length}
                  from={0}
                  locale={locale}
                />{" "}
                {t("result.titleSent", { count: queued.length })}
              </>
            ) : (
              t("result.titleNone")
            )}
          </h1>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            {queued.length > 0 ? t("result.leadShort") : t("result.leadNone")}
          </p>
        </div>
      </header>

      <m.dl
        {...rise(0.1)}
        className="grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3"
      >
        <Fact label={t("send.summaryTemplate")}>{templateName}</Fact>
        <Fact label={t("send.summaryRole")}>{role}</Fact>
        <Fact label={t("result.sentAt")}>
          <time dateTime={sentAt.toISOString()} className="tabular-nums">
            {new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(sentAt)}
          </time>
        </Fact>
      </m.dl>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {missed.length > 0 && (
            <Missed
              missed={missed}
              onRetry={() => {
                onRetry(missed)
              }}
            />
          )}
          {people.length > 0 && <Queued people={people} />}
        </div>
        {queued.length > 0 && <NextSteps role={role} />}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row">
        <AppLink
          to={href("/employer/invitations")}
          className={buttonLink({
            variant: "outline",
            className: "max-md:h-11",
          })}
        >
          {t("result.done")}
        </AppLink>
        <Button className="max-md:h-11" onClick={onAgain}>
          {t("result.again")}
        </Button>
      </div>
    </div>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium">{children}</dd>
    </div>
  )
}

function Queued({ people }: { people: Recipient[] }) {
  const { t } = useTranslation("invitations")
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col overflow-hidden rounded-lg border"
    >
      <h2
        id={id}
        className="border-b bg-muted/30 px-4 py-2.5 text-sm font-medium"
      >
        {t("result.queuedTitle")}
      </h2>
      <ul className="flex max-h-96 flex-col divide-y overflow-y-auto">
        {people.map((person, i) => (
          <m.li
            key={person.email}
            {...rise(0.2 + Math.min(i, 6) * 0.03)}
            className="flex items-center gap-3 px-4 py-2.5"
          >
            <Monogram name={person.name || person.email} />
            <span className="flex min-w-0 flex-1 flex-col">
              {person.name && (
                <span className="truncate text-sm font-medium">
                  {person.name}
                </span>
              )}
              <span
                dir="ltr"
                className="truncate text-start text-xs text-muted-foreground"
              >
                {person.email}
              </span>
            </span>
            <StatusBadge tone="success">
              <Check aria-hidden="true" className="pop" strokeWidth={3} />
              {t("result.queued")}
            </StatusBadge>
          </m.li>
        ))}
      </ul>
    </section>
  )
}

function Missed({
  missed,
  onRetry,
}: {
  missed: Recipient[]
  onRetry: () => void
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  return (
    <m.section
      {...rise(0.15)}
      aria-labelledby={id}
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={id}
            className="flex items-center gap-2 text-sm font-medium text-danger"
          >
            <CircleAlert aria-hidden="true" className="size-4" />
            {t("result.missedTitle", { count: missed.length })}
          </h2>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            {t("result.missedBody")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="max-md:h-11"
          onClick={onRetry}
        >
          <RotateCcw />
          {t("result.retry")}
        </Button>
      </div>
      <ul className="flex flex-col gap-2">
        {missed.map((recipient) => (
          <li key={recipient.email} className="flex items-center gap-3">
            <Monogram
              name={recipient.name || recipient.email}
              className="bg-danger-muted text-danger"
            />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {recipient.name}
              </span>
              <span
                dir="ltr"
                className="truncate text-start text-xs text-muted-foreground"
              >
                {recipient.email}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </m.section>
  )
}

function NextSteps({ role }: { role: string }) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const steps = [
    t("result.nextEmail"),
    t("result.nextSetup"),
    t("result.nextInterview", { role }),
  ]
  return (
    <m.section
      {...rise(0.25)}
      aria-labelledby={id}
      className="flex flex-col gap-4 rounded-lg border p-4"
    >
      <h2 id={id} className="text-sm font-medium">
        {t("result.nextTitle")}
      </h2>
      <ol className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm text-pretty">
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full border text-xs font-medium text-muted-foreground tabular-nums"
            >
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </m.section>
  )
}
