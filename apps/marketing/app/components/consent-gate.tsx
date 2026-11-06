import { clearConsent, setConsent, useConsent } from "@workspace/analytics"
import { ConsentBanner } from "@workspace/blocks/consent-banner"
import { localePath } from "@workspace/i18n"
import { Trans, useLocale, useTranslation } from "@workspace/i18n/react"
import { Link } from "react-router"

import { useConsentPending } from "@/hooks/use-consent-pending"
import { useHydrated } from "@/hooks/use-hydrated"
import { analyticsEnabled } from "@/lib/analytics"
import { PAGES } from "@/lib/pages"

/** Shown after hydration only, so prerendered HTML never contains it. */
export function ConsentGate() {
  const { t } = useTranslation("common")
  const lang = useLocale()
  const pending = useConsentPending()

  if (!pending) return null

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
        components={[
          <Link key="policy" to={localePath(lang, PAGES.privacy.path)} />,
        ]}
      />
    </ConsentBanner>
  )
}

/** Lets a visitor take back their answer; the banner asks again. */
export function ConsentSettings() {
  const { t } = useTranslation("common")
  const consent = useConsent()
  const hydrated = useHydrated()

  if (!analyticsEnabled || !hydrated || !consent) return null

  return (
    <button
      type="button"
      onClick={clearConsent}
      className="w-fit rounded-sm py-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {t("footer.cookieSettings")}
    </button>
  )
}
