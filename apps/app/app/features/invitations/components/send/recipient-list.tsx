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
  if (recipients.length === 0) return null
  const over = recipients.length > RECIPIENT_LIMIT

  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={id} className="text-sm font-medium tabular-nums">
          {t("send.listTitle", { count: recipients.length })}
        </h3>
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
      </div>
      {over && (
        <p role="alert" className="text-sm text-danger">
          {t("send.overLimit", { max: RECIPIENT_LIMIT })}
        </p>
      )}
      <ul className="max-h-96 divide-y overflow-y-auto rounded-lg border">
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
              className="flex items-center gap-3 px-3 py-2"
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
