import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { CircleAlert, MailCheck } from "lucide-react"
import * as m from "motion/react-m"
import { useId } from "react"
import { href } from "react-router"

import { AnimatedNumber } from "@/components/animated-number"
import { AppLink } from "@/components/app-link"
import { buttonLink } from "@/lib/button-link"
import { duration, ease } from "@/lib/motion"

import type { Recipient } from "../../lib/recipients"
import { EnvelopeArt } from "../art/envelope-art"

export function SendResult({
  queued,
  missed,
  role,
  onAgain,
}: {
  queued: string[]
  missed: Recipient[]
  role: string
  onAgain: () => void
}) {
  const { t } = useTranslation("invitations")
  const locale = useLocale()
  const queuedId = useId()
  const missedId = useId()

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease }}
        >
          <EnvelopeArt />
        </m.div>
        <div>
          <h1
            tabIndex={-1}
            ref={(el) => el?.focus()}
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
            {queued.length > 0
              ? t("result.lead", { role })
              : t("result.leadNone")}
          </p>
        </div>
      </div>

      {missed.length > 0 && (
        <section
          aria-labelledby={missedId}
          className="flex flex-col gap-2 rounded-lg border p-4"
        >
          <h2
            id={missedId}
            className="flex items-center gap-2 text-sm font-medium text-danger"
          >
            <CircleAlert aria-hidden="true" className="size-4" />
            {t("result.missedTitle", { count: missed.length })}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            {t("result.missedBody")}
          </p>
          <ul className="flex flex-col gap-1 text-sm">
            {missed.map((recipient) => (
              <li key={recipient.email} className="truncate">
                {recipient.name}{" "}
                <span className="text-muted-foreground">{recipient.email}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {queued.length > 0 && (
        <section aria-labelledby={queuedId} className="flex flex-col gap-2">
          <h2 id={queuedId} className="text-sm font-medium">
            {t("result.queuedTitle")}
          </h2>
          <ul className="flex max-h-64 flex-col divide-y overflow-y-auto rounded-lg border text-sm">
            {queued.map((email, i) => (
              <m.li
                key={email}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: duration.base,
                  ease,
                  delay: 0.2 + Math.min(i, 6) * 0.03,
                }}
                className="flex items-center gap-2 px-3 py-2"
              >
                <MailCheck
                  aria-hidden="true"
                  className="size-4 shrink-0 text-success"
                />
                <span className="truncate">{email}</span>
              </m.li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={onAgain}>{t("result.again")}</Button>
        <AppLink
          to={href("/employer/invitations")}
          className={buttonLink({ variant: "outline" })}
        >
          {t("result.done")}
        </AppLink>
      </div>
    </div>
  )
}
