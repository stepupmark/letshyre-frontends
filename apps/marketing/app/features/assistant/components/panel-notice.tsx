import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { PAGES } from "@/lib/pages"

export function PanelNotice() {
  const { t } = useTranslation("assistant")
  const lang = useLocale()

  return (
    <p className="text-center text-xs text-pretty text-muted-foreground">
      <Trans
        t={t}
        i18nKey="chatbot.notice"
        components={[
          <Link
            key="policy"
            to={localePath(lang, PAGES.privacy.path)}
            className="underline underline-offset-4 hover:text-foreground"
          />,
        ]}
      />
    </p>
  )
}
