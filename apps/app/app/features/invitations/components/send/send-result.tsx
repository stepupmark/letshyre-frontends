import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { Check, CircleAlert, RotateCcw } from "lucide-react"
import * as m from "motion/react-m"
import { useEffect, useId, useRef } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import type { Recipient } from "../../lib/recipients"
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
  const anySent = queued.length > 0
  const time = new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(
    sentAt
  )

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <header className="flex items-start gap-4">
        <m.span
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: duration.slow, ease }}
          data-sent={anySent}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-muted text-danger data-[sent=true]:bg-success-muted data-[sent=true]:text-success"
        >
          {anySent ? (
            <Check className="size-5" strokeWidth={2.5} />
          ) : (
            <CircleAlert className="size-5" />
          )}
        </m.span>
        <div className="min-w-0">
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-semibold tracking-tight text-balance outline-none"
          >
            {anySent ? (
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
            {[templateName, role].filter(Boolean).join(" · ")}
            {" · "}
            <time dateTime={sentAt.toISOString()} className="tabular-nums">
              {time}
            </time>
          </p>
        </div>
      </header>

      {missed.length > 0 && (
        <Missed
          missed={missed}
          onRetry={() => {
            onRetry(missed)
          }}
        />
      )}
      {people.length > 0 && <Queued people={people} />}

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
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

function Queued({ people }: { people: Recipient[] }) {
  const { t } = useTranslation("invitations")
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="sr-only">
        {t("result.queuedTitle")}
      </h2>
      <ul className="flex max-h-96 flex-col divide-y overflow-y-auto rounded-lg border">
        {people.map((person, i) => (
          <m.li
            key={person.email}
            {...rise(0.15 + Math.min(i, 6) * 0.03)}
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
            <Check
              aria-hidden="true"
              className="pop size-4 shrink-0 text-success"
              strokeWidth={2.5}
            />
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
      {...rise(0.1)}
      aria-labelledby={id}
      className="flex flex-col gap-3 rounded-lg border p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={id}
            className="flex items-center gap-2 text-sm font-medium text-danger"
          >
            <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
            {t("result.missedTitle", { count: missed.length })}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("result.missedNote")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 max-md:h-11"
          onClick={onRetry}
        >
          <RotateCcw />
          {t("result.tryAgain")}
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
