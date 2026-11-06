import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  BriefcaseBusiness,
  Check,
  CircleAlert,
  Clock,
  Mail,
  RotateCcw,
} from "lucide-react"
import * as m from "motion/react-m"
import { useEffect, useId, useRef, type ReactNode } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import type { Recipient } from "../../lib/recipients"
import { Monogram } from "../shared/monogram"

const CHECK_PATH = "M5 12.5l4.5 4.5L19 7.5"

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

  useEffect(() => {
    heading.current?.focus()
  }, [])

  return (
    <m.section
      {...rise(0)}
      className="flex max-w-2xl flex-col overflow-hidden rounded-lg border bg-card"
    >
      <header className="flex items-center gap-4 p-5 sm:px-6">
        <StatusMark sent={anySent} />
        <div className="min-w-0">
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-xl font-semibold tracking-tight text-balance outline-none sm:text-2xl"
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
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <MetaItem icon={Mail}>{templateName}</MetaItem>
            {role && <MetaItem icon={BriefcaseBusiness}>{role}</MetaItem>}
            <MetaItem icon={Clock}>
              <time dateTime={sentAt.toISOString()} className="tabular-nums">
                {new Intl.DateTimeFormat(locale, { timeStyle: "short" }).format(
                  sentAt
                )}
              </time>
            </MetaItem>
          </ul>
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

      <footer className="flex flex-col-reverse gap-2 border-t bg-muted/30 px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
        <AppLink
          to={href("/employer/invitations")}
          className={buttonLink({
            variant: "outline",
            className: "bg-background max-md:h-11",
          })}
        >
          {t("result.done")}
        </AppLink>
        <Button className="max-md:h-11" onClick={onAgain}>
          {t("result.again")}
        </Button>
      </footer>
    </m.section>
  )
}

function StatusMark({ sent }: { sent: boolean }) {
  return (
    <m.span
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: duration.slow, ease }}
      data-sent={sent}
      className="grid size-11 shrink-0 place-items-center rounded-full bg-danger-muted text-danger ring-4 ring-danger-muted/40 data-[sent=true]:bg-success-muted data-[sent=true]:text-success data-[sent=true]:ring-success-muted/40"
    >
      {sent ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <m.path
            d={CHECK_PATH}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: duration.slow, ease, delay: 0.15 }}
          />
        </svg>
      ) : (
        <CircleAlert className="size-5" />
      )}
    </m.span>
  )
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: typeof Mail
  children: ReactNode
}) {
  return (
    <li className="flex min-w-0 items-center gap-1.5">
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="truncate">{children}</span>
    </li>
  )
}

function Queued({ people }: { people: Recipient[] }) {
  const { t } = useTranslation("invitations")
  const id = useId()
  return (
    <section aria-labelledby={id} className="border-t">
      <h2 id={id} className="sr-only">
        {t("result.queuedTitle")}
      </h2>
      <ul className="flex max-h-96 flex-col divide-y overflow-y-auto">
        {people.map((person, i) => (
          <m.li
            key={person.email}
            {...rise(0.15 + Math.min(i, 6) * 0.03)}
            className="flex items-center gap-3 px-5 py-3 sm:px-6"
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
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-success-muted text-success"
            >
              <Check className="pop size-3.5" strokeWidth={3} />
            </span>
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
      className="flex flex-col gap-3 border-t bg-danger-muted/30 px-5 py-4 sm:px-6"
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
          className="shrink-0 bg-background max-md:h-11"
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
              className="bg-background text-danger ring-1 ring-danger/20"
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
