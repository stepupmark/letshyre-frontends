import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import { X } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useId } from "react"

import { duration, ease } from "@/lib/motion"

import { RECIPIENT_LIMIT, type Recipient } from "../../lib/recipients"

export function RecipientList({
  recipients,
  onChange,
}: {
  recipients: Recipient[]
  onChange: (next: Recipient[]) => void
}) {
  const { t } = useTranslation("invitations")
  const id = useId()
  const over = recipients.length > RECIPIENT_LIMIT

  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col overflow-hidden rounded-lg border lg:sticky lg:top-20"
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2">
        <h3 id={id} className="flex items-center gap-2 text-sm font-medium">
          {t("send.steps.candidates")}
          {recipients.length > 0 && (
            <span className="rounded-full bg-brand-muted px-2 text-xs text-brand-text tabular-nums">
              {recipients.length}
            </span>
          )}
        </h3>
        {recipients.length > 0 && (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-muted-foreground"
            onClick={() => {
              onChange([])
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
        <p className="px-4 py-6 text-sm text-pretty text-muted-foreground">
          {t("send.listEmpty")}
        </p>
      )}
      <ul className="max-h-112 divide-y overflow-y-auto empty:hidden">
        <AnimatePresence initial={false}>
          {recipients.map((recipient, i) => (
            <m.li
              key={recipient.email.toLowerCase()}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{
                duration: duration.base,
                ease,
                delay: Math.min(i, 8) * 0.02,
              }}
              className="flex items-center gap-3 px-4 py-2"
            >
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-muted text-xs font-medium text-brand-text"
              >
                {(recipient.name || recipient.email).charAt(0).toUpperCase()}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <input
                  value={recipient.name}
                  aria-label={t("send.nameFor", { email: recipient.email })}
                  placeholder={t("send.namePlaceholder")}
                  onChange={(event) => {
                    onChange(
                      recipients.map((item, j) =>
                        j === i ? { ...item, name: event.target.value } : item
                      )
                    )
                  }}
                  className="-mx-1 rounded-sm bg-transparent px-1 text-sm font-medium outline-none placeholder:text-danger focus-visible:ring-2 focus-visible:ring-ring/50"
                />
                <span className="truncate text-xs text-muted-foreground">
                  {recipient.email}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={t("send.remove", { email: recipient.email })}
                className="text-muted-foreground max-md:size-10"
                onClick={() => {
                  onChange(recipients.filter((_, j) => j !== i))
                }}
              >
                <X />
              </Button>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  )
}
