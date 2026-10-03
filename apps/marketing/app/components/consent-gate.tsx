import { setConsent, useConsent } from "@workspace/analytics"
import { ConsentBanner } from "@workspace/blocks/consent-banner"
import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { useSyncExternalStore } from "react"
import { Link } from "react-router"

import { analyticsEnabled } from "@/lib/analytics"

const subscribe = () => () => undefined

/** Shown after hydration only, so prerendered HTML never contains it. */
export function ConsentGate() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const consent = useConsent()
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )

  if (!analyticsEnabled || !hydrated || consent) return null

  return (
    <ConsentBanner
      label={t("consent.label")}
      acceptLabel={t("consent.accept")}
      rejectLabel={t("consent.reject")}
      onAccept={() => {
        setConsent(true)
      }}
      onReject={() => {
        setConsent(false)
      }}
    >
      <Trans
        t={t}
        i18nKey="consent.body"
        components={[<Link key="policy" to={localePath(lang, "/policy")} />]}
      />
    </ConsentBanner>
  )
}
