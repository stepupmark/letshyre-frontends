import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CalendarClock, Check, Eye } from "lucide-react"
import * as m from "motion/react-m"

import { CopyButton } from "@/components/copy-button"
import { duration, ease } from "@/lib/motion"

import { type ShareLink } from "../schemas/share.schema"
import { shareUrl } from "../lib/share"

export function Created({ link, name }: { link: ShareLink; name: string }) {
  const { t } = useTranslation(["candidate", "common"])
  const locale = useLocale()
  const url = shareUrl(link)
  const expires = link.expires_at ? new Date(link.expires_at) : null

  return (
    <>
      <DialogHeader className="flex-row items-start gap-4">
        <m.span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: duration.slow, ease }}
        >
          <Check className="size-5" aria-hidden="true" />
        </m.span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <DialogTitle className="text-lg">{t("share.readyTitle")}</DialogTitle>
          <DialogDescription className="text-pretty">
            {t("share.readyLead", { name })}
          </DialogDescription>
        </span>
      </DialogHeader>
      {url ? (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-lg border bg-brand-muted/40 py-1.5 ps-3 pe-1.5">
            <p
              className="min-w-0 flex-1 truncate font-mono text-sm text-brand-text"
              dir="ltr"
              title={url}
            >
              {url}
            </p>
            <CopyButton value={url} label={t("share.copy")} />
          </div>
          <p className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {expires && !Number.isNaN(expires.getTime()) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 tabular-nums">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {t("share.expires", {
                  date: new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                  }).format(expires),
                })}
              </span>
            )}
            {link.max_views != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 tabular-nums">
                <Eye className="size-3.5" aria-hidden="true" />
                {t("share.viewLimit", { count: link.max_views })}
              </span>
            )}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("share.noLink")}</p>
      )}
      <DialogFooter>
        <DialogClose render={<Button />}>{t("share.done")}</DialogClose>
      </DialogFooter>
    </>
  )
}
