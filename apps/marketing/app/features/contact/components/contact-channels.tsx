import { localePath } from "@workspace/i18n"
import { useLocale, useTranslation } from "@workspace/i18n/react"
import { Separator } from "@workspace/ui/components/separator"
import { useId } from "react"
import { Link } from "react-router"

import { SUPPORT_EMAIL } from "../lib/channels"

export function ContactChannels() {
  const { t } = useTranslation("contact")
  const lang = useLocale()
  const titleId = useId()

  return (
    <aside aria-labelledby={titleId} className="flex flex-col gap-6">
      <h2 id={titleId} className="text-lg font-semibold">
        {t("channels.title")}
      </h2>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{t("info.emailLabel")}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="w-fit rounded-sm text-lg font-medium underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {SUPPORT_EMAIL}
        </a>
      </div>
      <Separator />
      <div className="flex flex-col gap-1">
        <p className="font-medium">{t("channels.candidates.title")}</p>
        <Link
          to={localePath(lang, "/how-it-works-interview")}
          className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {t("channels.candidates.link")}
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{t("channels.employers.title")}</p>
        <Link
          to={localePath(lang, "/pricing")}
          className="w-fit text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {t("channels.employers.link")}
        </Link>
      </div>
    </aside>
  )
}
