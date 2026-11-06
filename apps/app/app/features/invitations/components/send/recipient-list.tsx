import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { CircleAlert, X } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useEffect, useId, useRef } from "react"

import { AnimatedNumber } from "@/components/animated-number"
import { duration, ease, spring } from "@/lib/motion"
import { undoToast } from "@/lib/undo-toast"

import { RECIPIENT_LIMIT, type Recipient } from "../../lib/recipients"
import { Monogram } from "../shared/monogram"

export function RecipientList({
  recipients,
  repeated,
  onChange,
}: {
  recipients: Recipient[]
  /** addresses pasted again; their rows tint once so you can see where they are */
  repeated?: { emails: string[]; at: number }
  onChange: (next: Recipient[]) => void
}) {
  const { t } = useTranslation(["invitations", "common"])
  const locale = useLocale()
  const id = useId()
  const list = useRef<HTMLUListElement>(null)
  const over = recipients.length > RECIPIENT_LIMIT

  useEffect(() => {
    list.current
      ?.querySelector("[data-repeated=true]")
      ?.scrollIntoView({ block: "nearest" })
  }, [repeated?.at])

  const rename = (email: string, name: string) => {
    onChange(recipients.map((r) => (r.email === email ? { ...r, name } : r)))
  }

  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border"
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b bg-muted/30 px-4 py-1.5">
        <h3 id={id} className="flex items-center gap-2 text-sm font-medium">
          {t("send.steps.candidates")}
          <span className="text-xs text-muted-foreground tabular-nums">
            <AnimatedNumber value={recipients.length} locale={locale} />
            {" / "}
            {RECIPIENT_LIMIT}
          </span>
        </h3>
        {recipients.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-me-2 text-muted-foreground max-md:h-11"
            onClick={() => {
              const previous = recipients
              onChange([])
              undoToast(
                t("send.cleared", { count: previous.length }),
                t("common:undo"),
                () => {
                  onChange(previous)
                }
              )
            }}
          >
            {t("send.clear")}
          </Button>
        )}
      </div>
      {over && (
        <p role="alert" className="border-b px-4 py-2 text-sm text-danger">
          {t("send.overLimit", { max: RECIPIENT_LIMIT })}
        </p>
      )}
      {recipients.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-pretty text-muted-foreground">
          {t("send.listEmpty")}
        </p>
      )}
      <ul
        ref={list}
        className="max-h-112 divide-y overflow-y-auto empty:hidden"
      >
        <AnimatePresence initial={false}>
          {recipients.map((recipient) => {
            const key = recipient.email.toLowerCase()
            const unnamed = !recipient.name.trim()
            const tint = repeated?.emails.includes(key)
            return (
              <m.li
                key={key}
                data-repeated={tint}
                layout="position"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: duration.fast } }}
                transition={{ ...spring, opacity: { duration: duration.base } }}
                className="relative flex items-center gap-3 px-4 py-2"
              >
                {tint && (
                  <m.span
                    key={repeated?.at}
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, ease }}
                    className="pointer-events-none absolute inset-0 bg-brand-muted"
                  />
                )}
                <Monogram
                  name={recipient.name || recipient.email}
                  className="relative"
                />
                <span className="relative flex min-w-0 flex-1 flex-col">
                  <input
                    value={recipient.name}
                    aria-label={t("send.nameFor", { email: recipient.email })}
                    aria-invalid={unnamed}
                    placeholder={t("send.namePlaceholder")}
                    onChange={(event) => {
                      rename(recipient.email, event.target.value)
                    }}
                    className="-mx-1 rounded-sm bg-transparent px-1 text-sm font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:placeholder:text-danger"
                  />
                  <span
                    dir="ltr"
                    className="truncate text-start text-xs text-muted-foreground"
                  >
                    {recipient.email}
                  </span>
                </span>
                {unnamed && (
                  <CircleAlert
                    aria-hidden="true"
                    className="relative size-4 shrink-0 text-danger"
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("send.remove", { email: recipient.email })}
                  className="relative text-muted-foreground max-md:size-11"
                  onClick={() => {
                    onChange(
                      recipients.filter((r) => r.email !== recipient.email)
                    )
                  }}
                >
                  <X />
                </Button>
              </m.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </section>
  )
}
